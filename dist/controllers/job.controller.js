"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const job_service_1 = __importDefault(require("../services/job.service"));
const pagination_1 = require("../utils/pagination");
const createJob = async (req, res) => {
    try {
        const userId = req.user?.id;
        const job = await job_service_1.default.createJob(req.body, userId);
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
exports.default = {
    createJob,
    getAllJobs,
};
