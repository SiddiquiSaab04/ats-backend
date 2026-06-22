"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const supabase_1 = __importDefault(require("../config/supabase"));
const createApplication = async (data) => {
    try {
        const uploadResume = await supabase_1.default.storage.from("ATS").upload(`resume_${data.candidateId}_${Date.now()}.pdf`, data.resume, { contentType: "application/pdf" });
        if (uploadResume.error) {
            throw uploadResume.error;
        }
        const application = await client_1.prisma.application.create({
            data: {
                candidateId: Number(data.candidateId),
                jobId: Number(data.jobId),
                userName: data.userName,
                email: data.email,
                phone: data.phone,
                location: data.location,
                resumeUrl: uploadResume.data.path,
                coverLetter: data.coverLetter,
                status: "APPLIED"
            }
        });
        console.log("application created successfully");
        return application;
    }
    catch (error) {
        console.log("error in creating application", error);
        throw error;
    }
};
const getAllApplicationsForJob = async (candidateId, page = 1, limit = 10) => {
    try {
        const applicationList = await client_1.prisma.application.findMany({
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
        });
        const totalCount = await client_1.prisma.application.count({
            where: {
                candidateId: Number(candidateId)
            }
        });
        console.log("applications fetched successfully");
        return {
            data: applicationList,
            page,
            limit,
            totalCount
        };
    }
    catch (error) {
        console.log("error in fetching applications", error);
        throw error;
    }
};
exports.default = { createApplication, getAllApplicationsForJob };
