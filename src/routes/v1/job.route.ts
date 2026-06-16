import {Router} from "express";
import auth from "../../middlewares/auth.middleware";
import jobController from "../../controllers/job.controller";
const router = Router();

router.post("/", auth.auth, jobController.createJob);
router.get("/", auth.auth, auth.authorizeRole("RECRUITER", "CANDIDATE","ADMIN"), jobController.getAllJobs);
router.get("/:id",auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE","ADMIN"),jobController.getJobById);
router.put("/:id",auth.auth,auth.authorizeRole("RECRUITER","ADMIN"),jobController.updateJob);
router.delete("/:id",auth.auth,auth.authorizeRole("RECRUITER","ADMIN"),jobController.deleteJob);

export default router;