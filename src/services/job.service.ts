import { prisma } from "../prisma/client";
import { paginate } from "../utils/pagination";
import { redisClient } from "../redis/client";

const createJob = async (jobData:any , userId:number) => {
    const job = await prisma.job.create({
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
        }
    });
    if(jobData.skills && jobData.skills.length>0){
        await prisma.jobSkill.createMany({
            data: jobData.skills.map((skillId: number) => ({
                jobId: job.id,
                skillId: Number(skillId),
            }))
        })
    }
    const createdJob = await prisma.job.findUnique({
        where: { id: job.id },
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            company: true,
        }
    });

    // Invalidate cached job listing pages after job is created
    const keys = await redisClient.keys("jobs:*");
    if(keys.length > 0){
        await redisClient.del(keys);
    }

    if (createdJob) {
        const { jobSkills, ...rest } = createdJob;
        return {
            ...rest,
            skills: jobSkills.map((js: any) => js.skill)
        };
    }
    return createdJob;
}

const getAllJobs = async (page: number = 1, limit: number = 10) => {

    const cacheKey = `jobs:${page}:${limit}`;

    const cachedJobs = await redisClient.get(cacheKey);
    if(cachedJobs){
        return JSON.parse(cachedJobs);
    }
    
    const result = await paginate(prisma.job, { page, limit }, {
        orderBy: { createdAt: 'asc' },
        include: {
            jobSkills: {
                include: { skill: true }
            },
            company: true,
        }
    });

    const jobs = {
        ...result,
        data: result.data.map((job: any) => {
            const { jobSkills, ...rest } = job;
            return {
                ...rest,
                skills: jobSkills.map((js: any) => js.skill.name),
                company:{
                    id: job.companyId,
                    name: job.company.name,
                    description: job.company.description,
                    location: job.company.location,
                }
            };
        }),
    };

    await redisClient.set(cacheKey, JSON.stringify(jobs), { EX: 60*5 });

    return jobs;
}


export default {
    createJob,
    getAllJobs,
}