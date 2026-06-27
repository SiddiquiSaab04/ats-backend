import { Router } from "express";
import auth from "../../middlewares/auth.middleware"
import statsController from "../../controllers/stats.controller"
const router = Router();

router.get("/candidate", auth.auth, auth.authorizeRole("CANDIDATE"), statsController.getStatsForCandidate);
router.get("/recruiter", auth.auth, auth.authorizeRole("RECRUITER"), statsController.getStatsForRecruiter);
router.get("/admin", auth.auth, auth.authorizeRole("ADMIN"), statsController.getStatsForAdmin);
export default router;
