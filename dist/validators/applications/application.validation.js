"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllApplicationsForJobSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
const createApplicationSchema = zod_1.z.object({
    jobId: zod_1.z.coerce.number().min(1, "Job ID is required"),
    candidateId: zod_1.z.coerce.number().min(1, "Candidate ID is required").optional(),
    userName: zod_1.z.string().min(1, "User name is required"),
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(1, "Phone number is required"),
    location: zod_1.z.string().min(1, "Location is required"),
    coverLetter: zod_1.z.string().min(1, "Cover letter is required"),
});
exports.createApplicationSchema = createApplicationSchema;
const getAllApplicationsForJobSchema = zod_1.z.object({
    userName: zod_1.z.string().min(1, "User name is required").optional(),
    email: zod_1.z.string().email("Invalid email").optional(),
    phone: zod_1.z.string().min(1, "Phone number is required").optional(),
    location: zod_1.z.string().min(1, "Location is required").optional(),
    status: zod_1.z.enum(["APPLIED", "EXPIRED", "REJECTED"]).optional(),
    page: zod_1.z.coerce.number().min(1, "Page is required").optional(),
    limit: zod_1.z.coerce.number().min(1, "Limit is required").optional(),
});
exports.getAllApplicationsForJobSchema = getAllApplicationsForJobSchema;
