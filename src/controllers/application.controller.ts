import { prisma } from "../prisma/client";
import { Request, Response,NextFunction } from "express";
import applicationService from "../services/application.service";
import  {createApplicationSchema}  from "../validators/applications/application.validation";
import { AppError } from "../utils/AppError";

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

export default {
    createApplication,
}
