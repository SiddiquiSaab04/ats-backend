"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const supabase_1 = __importDefault(require("../config/supabase"));
const createApplication = async (data) => {
    try {
        const uploadResume = await supabase_1.default.storage.from("ATS").upload(`resume_${data.candidateId}_${Date.now()}.pdf`, data.resume);
        if (uploadResume.error) {
            throw uploadResume.error;
        }
        const application = await client_1.prisma.application.create({
            data: {
                candidateId: data.candidateId,
                jobId: Number(data.jobId),
                userName: data.userName,
                jobTitle: data.jobTitle,
                email: data.email,
                phone: data.phone,
                location: data.location,
                resumeUrl: uploadResume.data.path,
                coverLetter: data.coverLetter,
                status: data.status,
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
exports.default = {
    createApplication
};
