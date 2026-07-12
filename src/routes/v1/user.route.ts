import { Router } from "express";
import userController from "../../controllers/user.controller";
import auth from "../../middlewares/auth.middleware";

const router = Router();


router.get("/me", auth.auth, auth.authorizeRole("CANDIDATE","RECRUITER", "ADMIN"), userController.getCurrentUser);
router.get("/", auth.auth, auth.authorizeRole("ADMIN"), userController.getAllUsers);

export default router;
