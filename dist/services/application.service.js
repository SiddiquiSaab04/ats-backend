"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const supabase_1 = __importDefault(require("../config/supabase"));
const client_2 = require("../redis/client");
const pagination_1 = require("../utils/pagination");
let uploadResumePath;
const createApplication = async (data) => {
    try {
        const cacheKey = `applications:${data.candidateId}:${data.jobId}`;
        const cachedApplication = await client_2.redisClient.get(cacheKey);
        if (cachedApplication) {
            return JSON.parse(cachedApplication);
        }
        const uploadResume = await supabase_1.default.storage.from("ATS").upload(`resume_${data.candidateId}_${Date.now()}.pdf`, data.resume, { contentType: "application/pdf" });
        if (uploadResume.error) {
            throw uploadResume.error;
        }
        uploadResumePath = uploadResume.data.path;
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
        const cacheKeys = await client_2.redisClient.keys(`applications:${data.candidateId}:*`);
        if (cacheKeys.length > 0) {
            await client_2.redisClient.del(cacheKeys);
        }
        return application;
    }
    catch (error) {
        if (uploadResumePath) {
            await supabase_1.default.storage.from("ATS").remove([uploadResumePath]);
        }
        console.log("error in creating application", error);
        throw error;
    }
};
const getAllApplicationsForJob = async (candidateId, page = 1, limit = 10) => {
    try {
        const cacheKey = `applications:${candidateId}:${page}:${limit}`;
        const cachedApplications = await client_2.redisClient.get(cacheKey);
        if (cachedApplications) {
            return JSON.parse(cachedApplications);
        }
        const result = await (0, pagination_1.paginate)(client_1.prisma.application, { page, limit }, {
            where: { candidateId: Number(candidateId) },
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
        await client_2.redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 60 * 5
        });
        return {
            data: result.data,
            pagination: result.pagination
        };
    }
    catch (error) {
        throw error;
    }
};
const updateApplicationStatus = async (data) => {
    const cacheKey = `applications:${data.id}`;
    try {
        const application = await client_1.prisma.application.update({
            where: {
                id: data.id
            },
            data: {
                status: data.status
            }
        });
        await client_2.redisClient.del(cacheKey);
        return application;
    }
    catch (error) {
        throw error;
    }
};
const deleteApplication = async (data) => {
    const cacheKey = `applications:${data.id}`;
    try {
        const application = await client_1.prisma.application.delete({
            where: {
                id: data.id
            }
        });
        await client_2.redisClient.del(cacheKey);
        return "Application deleted successfully";
    }
    catch (error) {
        throw error;
    }
};
exports.default = { createApplication, getAllApplicationsForJob, updateApplicationStatus, deleteApplication };
