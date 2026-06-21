import { z } from "zod";

const createApplicationSchema = z.object({
    jobId: z.number().min(1, "Job ID is required"),
    candidateId: z.number().min(1, "Candidate ID is required"),
    userName: z.string().min(1, "User name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    location: z.string().min(1, "Location is required"),
    resumeUrl: z.string().min(1, "Resume URL is required"),
    coverLetter: z.string().min(1, "Cover letter is required"),
    status: z.enum(["PENDING","APPLIED","SHORTLISTED","INTERVIEW","OFFERED","REJECTED"]),
});