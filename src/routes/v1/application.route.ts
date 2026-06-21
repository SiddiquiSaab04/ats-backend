import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import {upload} from "../../middlewares/multer.middleware";
import applicationController from "../../controllers/application.controller";

const router = Router();

router.post("/", upload.single("resume"), auth.auth, auth.authorizeRole("CANDIDATE"), applicationController.createApplication);

export default router;