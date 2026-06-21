"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicationSchema = void 0;
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
