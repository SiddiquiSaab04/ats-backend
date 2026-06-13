import { Request, Response } from "express";
import jobService from "../services/job.service";
import { parsePaginationQuery } from "../utils/pagination";
import { prisma } from "../prisma/client";
import { createJobSchema } from "../validators/jobs/job.validation";
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
    const { page, limit } = parsePaginationQuery(req);
    const result = await jobService.getAllJobs(page, limit);
    return res.status(200).json({ success: true, message: "Jobs fetched successfully", ...result });
 } catch (error) {
    console.log("Error fetching jobs:", error);    
    return res.status(500).json({ success: false, message: "Error fetching jobs" });
 }
}

const getJobById = async(req:Request , res:Response) =>{
   try {
     const  {id} = req.params;
     const job = await jobService.getJobById(Number(id));
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
    const job = await jobService.updateJob(Number(id),req.body);
    res.status(200).json({success:true, message:"Job updated successfully",job});
   } catch (error) {
    console.log("Error updating job:", error);    
    return res.status(500).json({ success: false, message: "Error updating job" });
   }
}

const deleteJob = async (req:Request , res:Response) =>{
    try {
      const {id} = req.params;
      const existingJob = await prisma.job.findUnique({
          where: { id: Number(id) }
      });
      if(!existingJob){
          return res.status(404).json({ success: false, message: "Job not found" });
      }
      const job = await jobService.deleteJob(Number(id));
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