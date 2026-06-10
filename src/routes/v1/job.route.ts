import {Router} from "express";
import auth from "../../middlewares/auth.middleware";
import jobController from "../../controllers/job.controller";
const router = Router();

router.post("/", auth.auth, auth.authorizeRole("RECRUITER"), jobController.createJob);
router.get("/", auth.auth, auth.authorizeRole("RECRUITER", "CANDIDATE","ADMIN"), jobController.getAllJobs);

export default router;