"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const application_service_1 = __importDefault(require("../services/application.service"));
const application_validation_1 = require("../validators/applications/application.validation");
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
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
        if (!req.file.mimetype.includes("pdf") && !req.file.mimetype.includes("octet-stream")) {
            throw new AppError_1.AppError("Invalid file type", 400);
        }
        if (req.file.size > 2 * 1024 * 1024) {
            throw new AppError_1.AppError("File size must be less than 2MB", 400);
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
const getAllApplicationsForJob = async (req, res, next) => {
    try {
        const candidateId = req.user.id;
        const validationResult = application_validation_1.getAllApplicationsForJobSchema.safeParse({ ...req.query, candidateId });
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid query parameters", 400);
        }
        const { page, limit } = (0, pagination_1.parsePaginationQuery)(req);
        const applications = await application_service_1.default.getAllApplicationsForJob(candidateId, page, limit);
        return res.status(200).json({ success: true, message: "Applications fetched successfully", applications });
    }
    catch (error) {
        next(error);
    }
};
const updateApplicationStatus = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const validationResult = application_validation_1.updateApplicationSchema.safeParse({ ...req.body, id });
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid application data", 400);
        }
        const application = await application_service_1.default.updateApplicationStatus(validationResult.data);
        return res.status(200).json({ success: true, message: "Application updated successfully", application });
    }
    catch (error) {
        next(error);
    }
};
const deleteApplication = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const validationResult = application_validation_1.deleteApplicationSchema.safeParse({ id });
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid application data", 400);
        }
        const application = await application_service_1.default.deleteApplication(validationResult.data);
        return res.status(200).json({ success: true, message: "Application deleted successfully", application });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createApplication,
    getAllApplicationsForJob,
    updateApplicationStatus,
    deleteApplication
};
