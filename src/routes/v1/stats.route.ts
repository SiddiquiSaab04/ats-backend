import { Router } from "express";
import auth from "../../middlewares/auth.middleware"
import statsController from "../../controllers/stats.controller"
const router = Router();

router.get("/", auth.auth, auth.authorizeRole("CANDIDATE"), statsController.getStatsForCandidate);

export default router;
