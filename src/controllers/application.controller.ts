import { prisma } from "../prisma/client";
import { Request, Response,NextFunction } from "express";
import applicationService from "../services/application.service";
import  {createApplicationSchema,getAllApplicationsForJobSchema}  from "../validators/applications/application.validation";
import { AppError } from "../utils/AppError";
import { parsePaginationQuery } from "../utils/pagination";
const createApplication = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const candidateId = (req as any).user.id;
        const validationResult = createApplicationSchema.safeParse({ ...req.body, candidateId });
        if (!validationResult.success) {
            throw new AppError("Invalid application data", 400);
        }

        if (!req.file) {
            throw new AppError("Resume file is required", 400);
        }

        if (!req.file.mimetype.includes("pdf") && !req.file.mimetype.includes("octet-stream")) {
            throw new AppError("Invalid file type", 400);
        }

        if (req.file.size > 2 * 1024 * 1024) {
            throw new AppError("File size must be less than 2MB", 400);
        }

        const existingJob = await prisma.job.findUnique({
            where: { id: Number(validationResult.data.jobId) }
        });
        
        if(!existingJob ){
           throw new AppError("Job not found", 404);
        }

        if(existingJob.status === "EXPIRED"){
            throw new AppError("Job is expired", 400);
        }

        const existingApplication = await prisma.application.findFirst({
            where: { jobId: Number(validationResult.data.jobId), candidateId }
        });

        if(existingApplication){
            throw new AppError("You have already applied for this job", 400);
        }

        const applicationData = {
            ...validationResult.data,
            candidateId,
            resume: req.file.buffer
        };

        const application = await applicationService.createApplication(applicationData);
        return res.status(200).json({ success: true, message: "Application created successfully", application });
    } catch (error) {
        next(error);
    }
}

const getAllApplicationsForJob = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const candidateId = (req as any).user.id;
        const validationResult = getAllApplicationsForJobSchema.safeParse({ ...req.query, candidateId });
        if (!validationResult.success) {
            throw new AppError("Invalid query parameters", 400);
        }
        const {page,limit} = parsePaginationQuery(req);
        const applications = await applicationService.getAllApplicationsForJob(candidateId, page, limit);
        return res.status(200).json({ success: true, message: "Applications fetched successfully", applications });
    } catch (error) {
        next(error);
    }
}



export default {
    createApplication,
    getAllApplicationsForJob
}
