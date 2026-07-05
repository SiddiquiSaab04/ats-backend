import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { createSkillsController , getAllSkillsController , updateSkillsController , deleteSkillsController } from "../../controllers/skills.controller";

const router = Router();

router.post("/", auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE"), createSkillsController);
router.get("/", auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE"), getAllSkillsController);
router.patch("/:id", auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE"), updateSkillsController);
router.delete("/:id", auth.auth,auth.authorizeRole("RECRUITER","CANDIDATE"), deleteSkillsController);

export default router;