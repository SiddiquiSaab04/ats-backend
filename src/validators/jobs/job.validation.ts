import {z} from "zod";

const createJobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    requirements: z.string().optional().default(""),
    benefits: z.string().optional().default(""),
    location: z.string().min(1, "Location is required"),
    salary: z.string().min(1, "Salary is required"),
    companyId: z.number().min(1, "Company ID is required"),
    jobType: z.enum(
        [
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "INTERNSHIP",
            "REMOTE",
            "HYBRID",
            "ON_SITE"
        ]
    ),
    skills: z.array(z.number()).optional(),
    validTill: z.coerce.date(),
    status: z.enum(
        ["OPEN", "CLOSED", "EXPIRED"]
    ).optional().default("OPEN")
});


const updateJobSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    requirements: z.string().optional().default(""),
    benefits: z.string().optional().default(""),
    location: z.string().optional(),
    salary: z.string().optional(),
    companyId: z.number().optional(),
    jobType: z.enum(
        [
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "INTERNSHIP",
            "REMOTE",
            "HYBRID",
            "ON_SITE"
        ]
    ).optional(),
    skills: z.array(z.number()).optional(),
    validTill: z.coerce.date().optional(),
    status: z.enum(
        ["OPEN", "CLOSED", "EXPIRED"]
    ).optional()
});


const getJobByIdSchema = z.object({
    id: z.coerce.number().min(1, "Job ID is required and must be positive")
});

const getAllJobsSchema = z.object({
    page: z.coerce.number().min(1, "Page is required and must be positive").optional(),
    limit: z.coerce.number().min(1, "Limit is required and must be positive").optional(),
    search: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    location: z.string().optional(),
    salary: z.string().optional(),
    companyId: z.number().optional(),
    jobType: z.enum(
        [
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "INTERNSHIP",
            "REMOTE",
            "HYBRID",
            "ON_SITE"
        ]
    ).optional(),
    skills: z.array(z.number()).optional(),
    validTill: z.coerce.date().optional(),
    status: z.enum(
        ["OPEN", "CLOSED", "EXPIRED"]
    ).optional()
});

const getAllJobsByIdSchema = z.object({
    id: z.coerce.number().min(1, "User ID is required and must be positive"),

});

const deleteJobSchema = z.object({
    id: z.coerce.number().min(1, "Job ID is required and must be positive")
});


export {
    createJobSchema,
    updateJobSchema,
    getJobByIdSchema,
    getAllJobsByIdSchema,
    getAllJobsSchema,
    deleteJobSchema
};
