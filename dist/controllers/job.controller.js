"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const job_service_1 = __importDefault(require("../services/job.service"));
const pagination_1 = require("../utils/pagination");
const client_1 = require("../prisma/client");
const job_validation_1 = require("../validators/jobs/job.validation");
const AppError_1 = require("../utils/AppError");
const createJob = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const validationResult = job_validation_1.createJobSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid job data", 400);
        }
        const job = await job_service_1.default.createJob(validationResult.data, userId);
        return res.status(201).json({ success: true, message: "Job created successfully", job });
    }
    catch (error) {
        next(error);
    }
};
const getAllJobs = async (req, res, next) => {
    try {
        const validationResult = job_validation_1.getAllJobsSchema.safeParse(req.query);
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid query parameters", 400);
        }
        const { page, limit, search } = (0, pagination_1.parsePaginationQuery)(req);
        const result = await job_service_1.default.getAllJobs(page, limit, search);
        return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...result });
    }
    catch (error) {
        next(error);
    }
};
const getJobById = async (req, res, next) => {
    try {
        const validationResult = job_validation_1.getJobByIdSchema.safeParse(req.params);
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid job data", 400);
        }
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id: Number(validationResult.data.id) }
        });
        if (!existingJob) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        const job = await job_service_1.default.getJobById(validationResult.data);
        res.status(200).json({ success: true, message: "Job fetched successfully", job });
    }
    catch (error) {
        next(error);
    }
};
const updateJob = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const validationResult = job_validation_1.updateJobSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw new AppError_1.AppError("Invalid job data", 400);
        }
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id }
        });
        if (!existingJob) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        const job = await job_service_1.default.updateJob(id, validationResult.data);
        res.status(200).json({ success: true, message: "Job updated successfully", job });
    }
    catch (error) {
        next(error);
    }
};
const deleteJob = async (req, res, next) => {
    try {
        const validationResult = job_validation_1.deleteJobSchema.safeParse(req.params);
        if (!validationResult.success) {
            return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
        }
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id: Number(validationResult.data.id) }
        });
        if (!existingJob) {
            throw new AppError_1.AppError("Job not found", 404);
        }
        const job = await job_service_1.default.deleteJob(Number(validationResult.data.id));
        res.status(200).json({ success: true, message: "Job deleted successfully", job });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
};
