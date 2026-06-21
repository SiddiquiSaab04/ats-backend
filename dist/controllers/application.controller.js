"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const application_service_1 = __importDefault(require("../services/application.service"));
const application_validation_1 = require("../validators/applications/application.validation");
const AppError_1 = require("../utils/AppError");
const createApplication = async (req, res, next) => {
    try {
        const candidateId = req.user.id;
        const validationResult = application_validation_1.createApplicationSchema.safeParse({ ...req.body, candidateId });
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid application data", 400);
        }
        if (!req.file) {
            throw new AppError_1.AppError("Resume file is required", 400);
        }
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id: Number(validationResult.data.jobId) }
        });
        if (!existingJob) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        if (existingJob.status === "EXPIRED") {
            throw new AppError_1.AppError("Job is expired", 400);
        }
        const existingApplication = await client_1.prisma.application.findFirst({
            where: { jobId: Number(validationResult.data.jobId), candidateId }
        });
        if (existingApplication) {
            throw new AppError_1.AppError("You have already applied for this job", 400);
        }
        const applicationData = {
            ...validationResult.data,
            candidateId,
            resume: req.file.buffer
        };
        const application = await application_service_1.default.createApplication(applicationData);
        return res.status(200).json({ success: true, message: "Application created successfully", application });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createApplication,
};
