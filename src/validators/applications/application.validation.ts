import { z } from "zod";

const createApplicationSchema = z.object({
    jobId: z.coerce.number().min(1, "Job ID is required"),
    candidateId: z.coerce.number().min(1, "Candidate ID is required").optional(),
    userName: z.string().min(1, "User name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone number is required"),
    location: z.string().min(1, "Location is required"),
    coverLetter: z.string().min(1, "Cover letter is required"),
});

const getAllApplicationsForJobSchema = z.object({
    userName: z.string().min(1, "User name is required").optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(1, "Phone number is required").optional(),
    location: z.string().min(1, "Location is required").optional(),
    status:z.enum(["PENDING","APPLIED","SHORTLISTED","INTERVIEW","OFFERED","REJECTED"]).optional(),
    page: z.coerce.number().min(1, "Page is required").optional(),
    limit: z.coerce.number().min(1, "Limit is required").optional(),
});

const updateApplicationSchema = z.object({
    id: z.coerce.number().min(1, "Application ID is required"),
    status:z.enum(["PENDING","APPLIED","SHORTLISTED","INTERVIEW","OFFERED","REJECTED"]),
});

export {
    createApplicationSchema,
    getAllApplicationsForJobSchema,
    updateApplicationSchema
}