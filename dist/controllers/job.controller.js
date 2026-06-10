"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const job_service_1 = __importDefault(require("../services/job.service"));
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
exports.default = {
    createJob,
};
