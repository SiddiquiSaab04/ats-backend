import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import analyticsController from "../../controllers/analytics.controller";

const router = Router();

router.get("/", auth.auth, analyticsController.getAnalytics);

export default router;