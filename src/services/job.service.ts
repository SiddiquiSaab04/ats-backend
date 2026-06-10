import { prisma } from "../prisma/client";

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
    return job;
}

export default {
    createJob,
}