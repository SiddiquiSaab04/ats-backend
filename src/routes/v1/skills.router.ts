import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { createSkillsController } from "../../controllers/skills.controller";

const router = Router();

router.post("/", auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE"), createSkillsController);

export default router;