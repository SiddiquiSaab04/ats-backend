"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_service_1 = __importDefault(require("../services/application.service"));
const createApplication = async (req, res) => {
    try {
        const candidateId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Resume file is required" });
        }
        const applicationData = {
            ...req.body,
            candidateId,
            resume: req.file.buffer
        };
        const application = await application_service_1.default.createApplication(applicationData);
        return res.status(200).json({ success: true, message: "Application created successfully", application });
    }
    catch (error) {
        console.error("Error creating application:", error);
        return res.status(500).json({ success: false, message: "Error creating application" });
    }
};
exports.default = {
    createApplication,
};
