"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
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
        }
    });
    if (jobData.skills && jobData.skills.length > 0) {
        await client_1.prisma.jobSkill.createMany({
            data: jobData.skills.map((skillId) => ({
                jobId: job.id,
                skillId: Number(skillId),
            }))
        });
    }
    // Fetch the fully populated job to include skill names and company
    const createdJob = await client_1.prisma.job.findUnique({
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
    if (createdJob) {
        const { jobSkills, ...rest } = createdJob;
        return {
            ...rest,
            skills: jobSkills.map((js) => js.skill)
        };
    }
    return createdJob;
};
const getAllJobs = async () => {
    const jobs = await client_1.prisma.job.findMany({
        include: {
            jobSkills: {
                include: {
                    skill: true
                }
            },
            company: true,
        }
    });
    return jobs.map((job) => {
        const { jobSkills, ...rest } = job;
        return {
            ...rest,
            skills: jobSkills.map((js) => js.skill)
        };
    });
};
exports.default = {
    createJob,
    getAllJobs,
};
