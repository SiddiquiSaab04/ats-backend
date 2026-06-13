import {prisma} from "../prisma/client";
import {paginate} from "../utils/pagination";
import {redisClient} from "../redis/client";
import {z} from "zod";
import {createJobSchema, updateJobSchema, getJobByIdSchema} from "../validators/jobs/job.validation";

type CreateJobInput = z.infer<typeof createJobSchema>;
type UpdateJobInput = z.infer<typeof updateJobSchema>;
type GetJobByIdInput = z.infer<typeof getJobByIdSchema>;

const createJob = async (jobData : CreateJobInput, userId : number) => {
    const job = await prisma.job.create({
        data: {
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            location: jobData.location,
            salary: jobData.salary,
            companyId: Number(jobData.companyId),
            jobType: jobData.jobType as any,
            createdBy: Number(userId)
        }
    });
    if (jobData.skills && jobData.skills.length > 0) {
        await prisma.jobSkill.createMany({
            data: jobData.skills.map(
                (skillId : number) => ({jobId: job.id, skillId: Number(skillId)})
            )
        })
    }
    const createdJob = await prisma.job.findUnique({
        where: {
            id: job.id
        },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            company: true
        }
    });

    const keys = await redisClient.keys("jobs:*");
    if (keys.length > 0) {
        await redisClient.del(keys);
    }

    if (createdJob) {
        const {
            jobSkills,
            ...rest
        } = createdJob;
        return {
            ...rest,
            skills: jobSkills.map(
                (js : any) => js.skill
            )
        };
    }
    return createdJob;
}

const getAllJobs = async (page : number = 1, limit : number = 10 , search="") => {

    const cacheKey = `jobs:${page}:${limit}:${search || "all"}`;

    const cachedJobs = await redisClient.get(cacheKey);
    if (cachedJobs) {
        return JSON.parse(cachedJobs);
    }

    const result = await paginate(prisma.job, {
        page,
        limit,
        search
    }, {
        where: search ? {
            OR: [
                {
                    title: {
                        contains: search
                    }
                },
                {
                    location: {
                        contains: search
                    }
                },
                {
                    salary: {
                        contains: search
                    }
                }
            ]
        } : undefined,
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            company: true
        }
    });

    const jobs = {
        ... result,
        data: result.data.map(
            (job : any) => {
                const {
                    jobSkills,
                    ...rest
                } = job;
                return {
                    ...rest,
                    skills: jobSkills.map(
                        (js : any) => js.skill.name
                    ),
                    company: {
                        id: job.companyId,
                        name: job.company.name,
                        description: job.company.description,
                        location: job.company.location
                    }
                };
            }
        )
    };

    await redisClient.set(cacheKey, JSON.stringify(jobs), {
        EX: 60 * 5
    });

    return jobs;
}


const getJobById = async (jobData : GetJobByIdInput) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobData.id
        },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            company: true
        }

    })

    if (! job) {
        throw new Error("Job not found");
    }
    const {
        jobSkills,
        ...rest
    } = job;
    return {
        ...rest,
        skills: jobSkills.map(
            (js : any) => js.skill.name
        ),
        company: {
            id: job.companyId,
            name: job.company.name,
            description: job.company.description,
            location: job.company.location
        }
    }
}


const updateJob = async (id : number, jobData : UpdateJobInput) => {

    const job = await prisma.job.update({
        where: {
            id
        },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            }
        },
        data: {
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            location: jobData.location,
            salary: jobData.salary,
            companyId: jobData.companyId,
            jobType: jobData.jobType
        }
    });
    if (jobData.skills && jobData.skills.length > 0) { // Delete existing skills for this job
        await prisma.jobSkill.deleteMany({
            where: {
                jobId: job.id
            }
        });

        // Create the new skills
        await prisma.jobSkill.createMany({
            data: jobData.skills.map(
                (skillId : number) => ({jobId: Number(id), skillId: Number(skillId)})
            )
        });
    }

    if (job) {
        const keys = await redisClient.keys("jobs:*");
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        const updatedJob = await prisma.job.findUnique({
            where: {
                id: job.id
            },
            include: {
                jobSkills: {
                    include: {
                        skill: true
                    }
                },
                company: true
            }
        });

        if (updatedJob) {
            const {
                jobSkills,
                ...rest
            } = updatedJob;
            return {
                ...rest,
                skills: jobSkills.map(
                    (js : any) => js.skill.name
                ),
                company: {
                    id: updatedJob.companyId,
                    name: updatedJob.company.name,
                    description: updatedJob.company.description,
                    location: updatedJob.company.location
                }
            }
        }
    }
    return job;
}

const deleteJob = async (id : number) => {
    const job = await prisma.job.delete({where: {
            id
        }});
    const keys = await redisClient.keys("jobs:*");
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
}

export default {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
}
