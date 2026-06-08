import userRoute from "./v1/user.route";
import authRoute from "./v1/auth.route";
import { Router } from "express";
const router = Router();
router.use("/user", userRoute);
router.use("/auth", authRoute);
export default router;