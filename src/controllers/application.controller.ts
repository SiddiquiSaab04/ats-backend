import { Request, Response } from "express";
import applicationService from "../services/application.service";
const createApplication = async (req: Request, res: Response) => {
    try {
        const application = await applicationService.createApplication(req.body);
        return res.status(200).json({ success: true, message: "Application created successfully", application });
    } catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({ success: false, message: "Error creating application" });
    }
}

export default {
    createApplication,
}
