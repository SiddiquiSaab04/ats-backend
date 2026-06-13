import { z } from "zod";

const createJobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    requirements: z.string().optional().default(""),
    benefits: z.string().optional().default(""),
    location: z.string().min(1, "Location is required"),
    salary: z.string().min(1, "Salary is required"),
    companyId: z.number().min(1, "Company ID is required"),
    jobType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","REMOTE","HYBRID","ON_SITE"]),
    skills: z.array(z.number()).optional(),
});


const updateJobSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    requirements: z.string().optional().default(""),
    benefits: z.string().optional().default(""),
    location: z.string().min(1, "Location is required").optional(),
    salary: z.string().min(1, "Salary is required").optional(),
    companyId: z.number().min(1, "Company ID is required").optional(),
    jobType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","REMOTE","HYBRID","ON_SITE"]).optional(),
    skills: z.array(z.number()).optional(),
});


export {
    createJobSchema,
    updateJobSchema
};