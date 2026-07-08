"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const pagination_1 = require("../utils/pagination");
const client_2 = require("../redis/client");
const createJob = async (jobData, userId) => {
    const job = await client_1.prisma.job.create({
        data: {
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            benefits: jobData.benefits,
            location: jobData.location,
            salary: jobData.salary,
            companyId: Number(jobData.companyId),
            jobType: jobData.jobType,
            createdBy: Number(userId),
            validTill: jobData.validTill,
            status: jobData.status || "OPEN"
        }
    });
    if (jobData.skills && jobData.skills.length > 0) {
        await client_1.prisma.jobSkill.createMany({
            data: jobData.skills.map((skillId) => ({ jobId: job.id, skillId: Number(skillId) }))
        });
    }
    const createdJob = await client_1.prisma.job.findUnique({
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
    const keys = await client_2.redisClient.keys("jobs:*");
    if (keys.length > 0) {
        await client_2.redisClient.del(keys);
    }
    if (createdJob) {
        const { jobSkills, ...rest } = createdJob;
        return {
            ...rest,
            skills: jobSkills.filter((js) => js.skill).map((js) => js.skill.name)
        };
    }
    return createdJob;
};
const getAllJobs = async (page = 1, limit = 10, search = "") => {
    const cacheKey = `jobs:${page}:${limit}:${search || "all"}`;
    const cachedJobs = await client_2.redisClient.get(cacheKey);
    if (cachedJobs) {
        return JSON.parse(cachedJobs);
    }
    const result = await (0, pagination_1.paginate)(client_1.prisma.job, {
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
                }, {
                    location: {
                        contains: search
                    }
                }, {
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
        ...result,
        data: result.data.map((job) => {
            const { jobSkills, ...rest } = job;
            return {
                ...rest,
                skills: jobSkills.filter((js) => js.skill).map((js) => js.skill.name),
                company: job.company ? {
                    id: job.companyId,
                    name: job.company?.name || "Unknown Company",
                    description: job.company?.description || "",
                    location: job.company?.location || ""
                } : null
            };
        })
    };
    await client_2.redisClient.set(cacheKey, JSON.stringify(jobs), {
        EX: 60 * 3
    });
    return jobs;
};
const getAllJobsById = async (userId, page = 1, limit = 10, search = "") => {
    const result = await (0, pagination_1.paginate)(client_1.prisma.job, {
        page,
        limit,
        search
    }, {
        where: {
            createdBy: userId,
            ...(search ? {
                OR: [
                    {
                        title: {
                            contains: search
                        }
                    }, {
                        location: {
                            contains: search
                        }
                    }, {
                        salary: {
                            contains: search
                        }
                    }
                ]
            } : {})
        },
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            company: true
        }
    });
    return {
        ...result,
        data: result.data.map((job) => {
            const { jobSkills, ...rest } = job;
            return {
                ...rest,
                skills: jobSkills
                    .filter((js) => js.skill)
                    .map((js) => js.skill.name),
                company: job.company ? {
                    id: job.company.id,
                    name: job.company.name,
                    description: job.company.description,
                    location: job.company.location
                } : null
            };
        })
    };
};
const getJobById = async (jobData) => {
    const job = await client_1.prisma.job.findUnique({
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
    });
    if (!job) {
        throw new Error("Job not found");
    }
    const { jobSkills, ...rest } = job;
    return {
        ...rest,
        skills: jobSkills.filter((js) => js.skill).map((js) => js.skill.name),
        company: job.company ? {
            id: job.company.id,
            name: job.company.name,
            description: job.company.description,
            location: job.company.location
        } : null
    };
};
const updateJob = async (id, jobData) => {
    const job = await client_1.prisma.job.update({
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
            jobType: jobData.jobType,
            validTill: jobData.validTill
        }
    });
    if (jobData.skills && jobData.skills.length > 0) { // Delete existing skills for this job
        await client_1.prisma.jobSkill.deleteMany({
            where: {
                jobId: job.id
            }
        });
        // Create the new skills
        await client_1.prisma.jobSkill.createMany({
            data: jobData.skills.map((skillId) => ({ jobId: Number(id), skillId: Number(skillId) }))
        });
    }
    if (job) {
        const keys = await client_2.redisClient.keys("jobs:*");
        if (keys.length > 0) {
            await client_2.redisClient.del(keys);
        }
        const updatedJob = await client_1.prisma.job.findUnique({
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
            const { jobSkills, ...rest } = updatedJob;
            return {
                ...rest,
                skills: jobSkills.filter((js) => js.skill).map((js) => js.skill.name),
                company: updatedJob.company ? {
                    id: updatedJob.companyId,
                    name: updatedJob.company.name,
                    description: updatedJob.company.description,
                    location: updatedJob.company.location
                } : null
            };
        }
    }
    return job;
};
const deleteJob = async (id) => {
    const job = await client_1.prisma.job.delete({ where: {
            id
        } });
    const keys = await client_2.redisClient.keys("jobs:*");
    if (keys.length > 0) {
        await client_2.redisClient.del(keys);
    }
};
exports.default = {
    createJob,
    getAllJobs,
    getAllJobsById,
    getJobById,
    updateJob,
    deleteJob
};
