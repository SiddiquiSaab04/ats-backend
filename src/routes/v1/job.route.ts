import {Router} from "express";
import auth from "../../middlewares/auth.middleware";
import jobController from "../../controllers/job.controller";
const router = Router();

router.post("/", auth.auth, auth.authorizeRole("RECRUITER"), jobController.createJob);

export default router;