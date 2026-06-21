"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const createApplicationSchema = zod_1.z.object({
    jobId: zod_1.z.number().min(1, "Job ID is required"),
    candidateId: zod_1.z.number().min(1, "Candidate ID is required"),
    userName: zod_1.z.string().min(1, "User name is required"),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    location: zod_1.z.string().min(1, "Location is required"),
    resumeUrl: zod_1.z.string().min(1, "Resume URL is required"),
    coverLetter: zod_1.z.string().min(1, "Cover letter is required"),
    status: zod_1.z.enum(["PENDING", "APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"]),
});
