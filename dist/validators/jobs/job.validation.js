"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
const createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    requirements: zod_1.z.string().optional().default(""),
    benefits: zod_1.z.string().optional().default(""),
    location: zod_1.z.string().min(1, "Location is required"),
    salary: zod_1.z.string().min(1, "Salary is required"),
    companyId: zod_1.z.number().min(1, "Company ID is required"),
    jobType: zod_1.z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "HYBRID", "ON_SITE"]),
    skills: zod_1.z.array(zod_1.z.number()).optional(),
});
exports.createJobSchema = createJobSchema;
const updateJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").optional(),
    description: zod_1.z.string().min(1, "Description is required").optional(),
    requirements: zod_1.z.string().optional().default(""),
    benefits: zod_1.z.string().optional().default(""),
    location: zod_1.z.string().min(1, "Location is required").optional(),
    salary: zod_1.z.string().min(1, "Salary is required").optional(),
    companyId: zod_1.z.number().min(1, "Company ID is required").optional(),
    jobType: zod_1.z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "HYBRID", "ON_SITE"]).optional(),
    skills: zod_1.z.array(zod_1.z.number()).optional(),
});
exports.updateJobSchema = updateJobSchema;
