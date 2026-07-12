import { Router } from "express";
import auth from "../../middlewares/auth.middleware"
import statsController from "../../controllers/stats.controller"
const router = Router();

router.get("/", auth.auth, statsController.getStats);

export default router;

