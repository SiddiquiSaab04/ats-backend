import { prisma } from "../prisma/client";
import supabase from "../config/supabase";
import { createApplicationSchema , updateApplicationSchema } from "../validators/applications/application.validation"
import { z } from "zod";
import { redisClient } from "../redis/client";

type BaseApplicationData = z.infer<typeof createApplicationSchema>;
type updateApplicationInput = z.infer<typeof updateApplicationSchema>;
type createApplicationInput = BaseApplicationData & {
    resume: Buffer | File;
};

const createApplication = async (data: createApplicationInput) => {
    try {
        const uploadResume = await supabase.storage.from("ATS").upload(`resume_${data.candidateId
            }_${Date.now()
            }.pdf`, data.resume, { contentType: "application/pdf" });

        if (uploadResume.error) {
            throw uploadResume.error;
        }

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
        return application;
    } catch (error) {
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
        const applicationList = await prisma.application.findMany({
            where: {
                candidateId: Number(candidateId),
            },
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
        })

        const totalCount = await prisma.application.count({
            where: {
                candidateId: Number(candidateId)
            }
        });
        await redisClient.set(cacheKey, JSON.stringify(applicationList), {
            EX: 60 * 5
        });
        return {
            data: applicationList,
            page,
            limit,
            totalCount
        };
    } catch (error) {
        throw error;
    }
}


const updateApplicationStatus = async (data:updateApplicationInput) => {
    try {
        const application = await prisma.application.update({
            where: {
                id:data.id
            },
            data: {
                status:data.status
            }
        })
        console.log("application updated successfully");
        return application;
    } catch (error) {
        console.log("error in updating application", error);
        throw error;
    }
}

export default { createApplication, getAllApplicationsForJob,updateApplicationStatus }
