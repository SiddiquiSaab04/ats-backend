import { Router } from "express";
import userController from "../../controllers/user.controller";
import auth from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", auth.auth, auth.authorizeRole("ADMIN","RECRUITER"), userController.getAllUsers);

export default router;
