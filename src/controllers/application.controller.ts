import { Request, Response } from "express";
import applicationService from "../services/application.service";
const createApplication = async (req: Request, res: Response) => {
    try {
        const candidateId = (req as any).user.id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Resume file is required" });
        }

        const applicationData = {
            ...req.body,
            candidateId,
            resume: req.file.buffer
        };

        const application = await applicationService.createApplication(applicationData);
        return res.status(200).json({ success: true, message: "Application created successfully", application });
    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({ success: false, message: "Error creating application" });
    }
}

export default {
    createApplication,
}
