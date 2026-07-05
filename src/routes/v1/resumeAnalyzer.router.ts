import { Router } from "express";
import { analyzeResume } from "../../controllers/resumeAnalyzer.controller";

const router = Router();

router.post("/resume-analyzer/:id", analyzeResume);

export default router;