"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResume = void 0;
const resumeAnalyzer_service_1 = require("../services/resumeAnalyzer.service");
const AppError_1 = require("../utils/AppError");
/**
 * Controller to handle resume analysis request.
 * Invokes analyzeResumeService and returns the analyzed applications.
 */
const analyzeResume = async (req, res, next) => {
    try {
        const jobId = req.params.id || req.query.jobId;
        if (!jobId) {
            throw new AppError_1.AppError("Job ID is required", 400);
        }
        const result = await (0, resumeAnalyzer_service_1.analyzeResumeService)(Number(jobId));
        return res.status(200).json({
            success: true,
            message: "Resumes analyzed successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error in analyzing resume:", error);
        next(error);
    }
};
exports.analyzeResume = analyzeResume;
