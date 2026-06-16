import { Router } from "express";
import auth from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", auth.auth, auth.authorizeRole("CANDIDATE"));

export default router;