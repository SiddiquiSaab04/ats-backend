import userRoute from "./v1/user.route";
import { Router } from "express";
const router = Router();
router.use("/user", userRoute);
export default router;