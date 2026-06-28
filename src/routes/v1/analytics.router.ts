import { Router } from "express";
import  auth  from "../../middlewares/auth.middleware";
import analyticsController from "../../controllers/analytics.controller";

const router = Router();

router.get("/candidate",auth.auth,auth.authorizeRole("CANDIDATE"),analyticsController.getAnalyticsForCandidate);
// router.get("/recruiter",auth.auth,auth.authorizeRole("RECRUITER"),analyticsController.getStatsForRecruiter);
// router.get("/admin",auth.auth,auth.authorizeRole("ADMIN"),analyticsController.getStatsForAdmin);

export default router;