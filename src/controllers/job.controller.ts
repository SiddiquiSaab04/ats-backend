import {Request, Response, NextFunction} from "express";
import jobService from "../services/job.service";
import {parsePaginationQuery} from "../utils/pagination";
import {prisma} from "../prisma/client";
import {
    createJobSchema,
    updateJobSchema,
    getJobByIdSchema,
    getAllJobsSchema,
    getAllJobsByIdSchema,
    deleteJobSchema
} from "../validators/jobs/job.validation";
import {AppError} from "../utils/AppError";

const createJob = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const userId = (req as any).user ?. id as number;
        const validationResult = createJobSchema.safeParse(req.body);
        if (! validationResult.success) {
            throw new AppError("Invalid job data", 400);
        }
        const job = await jobService.createJob(validationResult.data, userId);
        return res.status(201).json({success: true, message: "Job created successfully", job});
    } catch (error) {
        next(error);
    }
}

const getAllJobs = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const validationResult = getAllJobsSchema.safeParse(req.query);
        if (! validationResult.success) {
            throw new AppError("Invalid query parameters", 400);
        }
        const {page, limit, search} = parsePaginationQuery(req);
        const result = await jobService.getAllJobs(page, limit, search);
        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            ... result
        });
    } catch (error) {
        next(error);
    }
}

const getAllJobsById = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const userId = (req as any).user?.id as number;
        const role = (req as any).user?.role as string;
        if(!userId){
            throw new AppError("You are not authenticated",401);
        }
        if(role !== "RECRUITER"){
            throw new AppError("You are not authorized to access this resource",403);
        }
        const validationResult = getAllJobsSchema.safeParse(req.query);
        if (!validationResult.success) {
            throw new AppError("Invalid query parameters", 400);
        }
        const {page, limit, search} = parsePaginationQuery(req);
        const result = await jobService.getAllJobsById(userId, page, limit, search);
        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            ...result
        });
    } catch (error) {
        next(error);
    }
}

const getJobById = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const validationResult = getJobByIdSchema.safeParse(req.params);
        if (! validationResult.success) {
            throw new AppError("Invalid job data", 400);
        }

        const existingJob = await prisma.job.findUnique({
            where: {
                id: Number(validationResult.data.id)
            }
        });
        if (! existingJob) {
            throw new AppError("Job not found", 404);
        }

        const job = await jobService.getJobById(validationResult.data);
        res.status(200).json({success: true, message: "Job fetched successfully", job});
    } catch (error) {
        next(error);
    }
}

const updateJob = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const id = Number(req.params.id);
        const validationResult = updateJobSchema.safeParse(req.body);
        if (! validationResult.success) {
            throw new AppError("Invalid job data", 400);
        }
        const existingJob = await prisma.job.findUnique({where: {
                id
            }});
        if (! existingJob) {
            throw new AppError("Job not found", 404);
        }
        const job = await jobService.updateJob(id, validationResult.data);
        res.status(200).json({success: true, message: "Job updated successfully", job});
    } catch (error) {
        next(error);
    }
}

const deleteJob = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const validationResult = deleteJobSchema.safeParse(req.params);
        if (! validationResult.success) {
            return res.status(400).json({success: false, message: "Invalid job data", errors: validationResult.error.issues});
        }
        const existingJob = await prisma.job.findUnique({
            where: {
                id: Number(validationResult.data.id)
            }
        });
        if (! existingJob) {
            throw new AppError("Job not found", 404);
        }
        const job = await jobService.deleteJob(Number(validationResult.data.id));
        res.status(200).json({success: true, message: "Job deleted successfully", job});
    } catch (error) {
        next(error);
    }
}

export default {
    createJob,
    getAllJobs,
    getAllJobsById,
    getJobById,
    updateJob,
    deleteJob
}
