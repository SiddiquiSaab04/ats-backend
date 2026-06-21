"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJobSchema = exports.getAllJobsSchema = exports.getJobByIdSchema = exports.updateJobSchema = exports.createJobSchema = void 0;
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
    validTill: zod_1.z.coerce.date(),
});
exports.createJobSchema = createJobSchema;
const updateJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").optional(),
    description: zod_1.z.string().min(1, "Description is required").optional(),
    requirements: zod_1.z.string().optional().default(""),
    benefits: zod_1.z.string().optional().default(""),
    location: zod_1.z.string().optional(),
    salary: zod_1.z.string().optional(),
    companyId: zod_1.z.number().optional(),
    jobType: zod_1.z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "HYBRID", "ON_SITE"]).optional(),
    skills: zod_1.z.array(zod_1.z.number()).optional(),
    validTill: zod_1.z.coerce.date().optional(),
});
exports.updateJobSchema = updateJobSchema;
const getJobByIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().min(1, "Job ID is required and must be positive"),
});
exports.getJobByIdSchema = getJobByIdSchema;
const getAllJobsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, "Page is required and must be positive").optional(),
    limit: zod_1.z.coerce.number().min(1, "Limit is required and must be positive").optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    requirements: zod_1.z.string().optional(),
    benefits: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    salary: zod_1.z.string().optional(),
    companyId: zod_1.z.number().optional(),
    jobType: zod_1.z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "HYBRID", "ON_SITE"]).optional(),
    skills: zod_1.z.array(zod_1.z.number()).optional(),
    validTill: zod_1.z.coerce.date().optional(),
});
exports.getAllJobsSchema = getAllJobsSchema;
const deleteJobSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().min(1, "Job ID is required and must be positive"),
});
exports.deleteJobSchema = deleteJobSchema;
