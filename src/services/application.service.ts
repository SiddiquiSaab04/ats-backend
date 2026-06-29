import { prisma } from "../prisma/client";
import supabase from "../config/supabase";
import { createApplicationSchema , updateApplicationSchema , deleteApplicationSchema} from "../validators/applications/application.validation"
import { z } from "zod";
import { redisClient } from "../redis/client";
import { paginate } from "../utils/pagination";

type BaseApplicationData = z.infer<typeof createApplicationSchema>;
type updateApplicationInput = z.infer<typeof updateApplicationSchema>;
type deleteApplicationInput = z.infer<typeof deleteApplicationSchema>;
type createApplicationInput = BaseApplicationData & {
    resume: Buffer | File;
};
    let uploadResumePath: string | null;

const createApplication = async (data: createApplicationInput) => {
    try {
        const cacheKey = `applications:${data.candidateId}:${data.jobId}`;
        const cachedApplication = await redisClient.get(cacheKey);
        if (cachedApplication) {
            return JSON.parse(cachedApplication);
        }

        const uploadResume = await supabase.storage.from("ATS").upload(`resume_${data.candidateId
            }_${Date.now()
            }.pdf`, data.resume, { contentType: "application/pdf" });

        if (uploadResume.error) {
            throw uploadResume.error;
        }

        uploadResumePath = uploadResume.data.path;

        const application = await prisma.application.create({
            data: {
                candidateId: Number(data.candidateId),
                jobId: Number(data.jobId),
                userName: data.userName as string,
                email: data.email as string,
                phone: data.phone as string,
                location: data.location as string,
                resumeUrl: uploadResume.data.path as string,
                coverLetter: data.coverLetter as string,
                status: "APPLIED"
            }
        })
        console.log("application created successfully");
        const cacheKeys = await redisClient.keys(`applications:${data.candidateId}:*`);
        if (cacheKeys.length > 0) {
            await redisClient.del(cacheKeys);
        }
        return application;
    } catch (error) {
        if(uploadResumePath){
            await supabase.storage.from("ATS").remove([uploadResumePath]);
        }
        console.log("error in creating application", error);
        throw error;
    }
}

const getAllApplicationsForJob = async (candidateId: number, page: number = 1, limit: number = 10) => {
    try {
        const cacheKey = `applications:${candidateId}:${page}:${limit}`;
        const cachedApplications = await redisClient.get(cacheKey);
        if (cachedApplications) {
            return JSON.parse(cachedApplications);
        }
        const result = await paginate(prisma.application,{page,limit},{
            where:{candidateId:Number(candidateId)},
            include: {
                job: {
                    omit: {
                        requirements: true,
                        benefits: true,
                        createdBy: true,
                        companyId: true,
                        updatedAt: true,
                        createdAt: true,
                    },
                    include: {
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
        }
        )

        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 60 * 5
        });
        return {
            data: result.data,
            pagination: result.pagination
        };
    } catch (error) {
        throw error;
    }
}


const updateApplicationStatus = async (data:updateApplicationInput) => {
    const cacheKey = `applications:${data.id}`;
    try {
        const application = await prisma.application.update({
            where: {
                id: data.id
            },
            data: {
                status:data.status
            }
        })
        await redisClient.del(cacheKey);
        return application;
    } catch (error) {
        throw error;
    }
}

const deleteApplication = async (data:deleteApplicationInput) => {
    const cacheKey = `applications:${data.id}`;
    try {
        const application = await prisma.application.delete({
            where: {
                id: data.id
            }
        })
        await redisClient.del(cacheKey);
        return "Application deleted successfully";
    } catch (error) {
        throw error;
    }
}

export default { createApplication, getAllApplicationsForJob,updateApplicationStatus,deleteApplication }
