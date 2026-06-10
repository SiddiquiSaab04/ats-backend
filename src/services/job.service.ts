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
    // Fetch the fully populated job to include skill names and company
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

    if (createdJob) {
        const { jobSkills, ...rest } = createdJob;
        return {
            ...rest,
            skills: jobSkills.map((js: any) => js.skill)
        };
    }
    return createdJob;
}

const getAllJobs = async () => {
    const jobs = await prisma.job.findMany({
        include:{
            jobSkills:{
                include:{
                    skill:true
                }
            },
            company: true,
        }
    });

    return jobs.map((job: any) => {
        const { jobSkills, ...rest } = job;
        return {
            ...rest,
            skills: jobSkills.map((js: any) => js.skill)
        };
    });
}


export default {
    createJob,
    getAllJobs,
}