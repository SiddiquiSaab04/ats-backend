"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const job_service_1 = __importDefault(require("../services/job.service"));
const pagination_1 = require("../utils/pagination");
const client_1 = require("../prisma/client");
const job_validation_1 = require("../validators/jobs/job.validation");
const createJob = async (req, res) => {
    try {
        const userId = req.user?.id;
        const validationResult = job_validation_1.createJobSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
        }
        const job = await job_service_1.default.createJob(validationResult.data, userId);
        return res.status(201).json({ success: true, message: "Job created successfully", job });
    }
    catch (error) {
        console.log("Error creating job:", error);
        return res.status(500).json({ success: false, message: "Error creating job" });
    }
};
const getAllJobs = async (req, res) => {
    try {
        const { page, limit } = (0, pagination_1.parsePaginationQuery)(req);
        const result = await job_service_1.default.getAllJobs(page, limit);
        return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...result });
    }
    catch (error) {
        console.log("Error fetching jobs:", error);
        return res.status(500).json({ success: false, message: "Error fetching jobs" });
    }
};
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await job_service_1.default.getJobById(Number(id));
        res.status(200).json({ success: true, message: "Job fetched successfully", job });
    }
    catch (error) {
        console.log("Error fetching job:", error);
        return res.status(500).json({ success: false, message: "Error fetching job" });
    }
};
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id: Number(id) }
        });
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        const job = await job_service_1.default.updateJob(Number(id), req.body);
        res.status(200).json({ success: true, message: "Job updated successfully", job });
    }
    catch (error) {
        console.log("Error updating job:", error);
        return res.status(500).json({ success: false, message: "Error updating job" });
    }
};
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const existingJob = await client_1.prisma.job.findUnique({
            where: { id: Number(id) }
        });
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        const job = await job_service_1.default.deleteJob(Number(id));
        res.status(200).json({ success: true, message: "Job deleted successfully", job });
    }
    catch (error) {
        console.log("Error deleting job:", error);
        return res.status(500).json({ success: false, message: "Error deleting job" });
    }
};
exports.default = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
};
