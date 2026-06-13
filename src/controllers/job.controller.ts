import { Request, Response } from "express";
import jobService from "../services/job.service";
import { parsePaginationQuery } from "../utils/pagination";
import { prisma } from "../prisma/client";
import { createJobSchema,updateJobSchema , getJobByIdSchema, getAllJobsSchema, deleteJobSchema } from "../validators/jobs/job.validation";

const createJob = async (req: Request, res: Response) => {
 try {
    const userId = (req as any).user?.id as number;
    const validationResult = createJobSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
    }
    

    const job = await jobService.createJob(validationResult.data, userId);
    return res.status(201).json({ success: true, message: "Job created successfully", job });
 } catch (error) {
    console.log("Error creating job:", error);    
    return res.status(500).json({ success: false, message: "Error creating job" });
 }
}

const getAllJobs = async (req: Request, res: Response) => {
 try {
    const validationResult = getAllJobsSchema.safeParse(req.query);
    if (!validationResult.success) {
        return res.status(400).json({ success: false, message: "Invalid query parameters", errors: validationResult.error.issues });
    }

    const { page, limit , search } = parsePaginationQuery(req);
    const result = await jobService.getAllJobs(page, limit , search);
    return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...result });
 } catch (error) {
    console.log("Error fetching jobs:", error);    
    return res.status(500).json({ success: false, message: "Error fetching jobs" });
 }
}

const getJobById = async(req:Request , res:Response) =>{
   try {
      const validationResult = getJobByIdSchema.safeParse(req.params);
      if (!validationResult.success) {
          return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
      }

      const existingJob = await prisma.job.findUnique({
          where: { id: Number(validationResult.data.id) }
      });
      if(!existingJob){
          return res.status(404).json({ success: false, message: "Job not found" });
      }

      const job = await jobService.getJobById(validationResult.data);
     res.status(200).json({success:true, message:"Job fetched successfully",job});
   } catch (error) {
     console.log("Error fetching job:", error);    
     return res.status(500).json({ success: false, message: "Error fetching job" });
   }
}

const updateJob = async (req:Request , res:Response)=>{
   try {
    const {id} = req.params;
    const existingJob = await prisma.job.findUnique({
        where: { id: Number(id) }
    });
    if(!existingJob){
        return res.status(404).json({ success: false, message: "Job not found" });
    }
    const validationResult = updateJobSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
    }
    const job = await jobService.updateJob(Number(id),validationResult.data);
    res.status(200).json({success:true, message:"Job updated successfully",job});
   } catch (error) {
    console.log("Error updating job:", error);    
    return res.status(500).json({ success: false, message: "Error updating job" });
   }
}

const deleteJob = async (req:Request , res:Response) =>{
    try {
      const validationResult = deleteJobSchema.safeParse(req.params);
      if (!validationResult.success) {
          return res.status(400).json({ success: false, message: "Invalid job data", errors: validationResult.error.issues });
      }
      const existingJob = await prisma.job.findUnique({
          where: { id: Number(validationResult.data.id) }
      });
      if(!existingJob){
          return res.status(404).json({ success: false, message: "Job not found" });
      }
      const job = await jobService.deleteJob(Number(validationResult.data.id));
      res.status(200).json({success:true, message:"Job deleted successfully",job});
    } catch (error) {
        console.log("Error deleting job:", error);
        return res.status(500).json({ success: false, message: "Error deleting job" });
    }
}

export default {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
}