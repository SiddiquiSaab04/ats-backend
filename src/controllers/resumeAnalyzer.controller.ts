import { Request, Response, NextFunction } from "express";
import { analyzeResumeService } from "../services/resumeAnalyzer.service";
import { AppError } from "../utils/AppError";

/**
 * Controller to handle resume analysis request.
 * Invokes analyzeResumeService and returns the analyzed applications.
 */
const analyzeResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.id || req.query.jobId;
    if (!jobId) {
      throw new AppError("Job ID is required", 400);
    }

    const result = await analyzeResumeService(Number(jobId));

    return res.status(200).json({
      success: true,
      message: "Resumes analyzed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in analyzing resume:", error);
    next(error);
  }
};

export { analyzeResume };