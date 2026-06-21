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

export {
    createApplicationSchema
}