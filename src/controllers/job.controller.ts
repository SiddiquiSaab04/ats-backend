import { Request, Response } from "express";
import jobService from "../services/job.service";

const createJob = async (req: Request, res: Response) => {
 try {
    const userId = (req as any).user?.id as number;
    const job = await jobService.createJob(req.body, userId);
    return res.status(201).json({ success: true, message: "Job created successfully", job });
 } catch (error) {
    console.log("Error creating job:", error);    
    return res.status(500).json({ success: false, message: "Error creating job" });
 }
}

export default {
    createJob,
}