"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const multer_middleware_1 = require("../../middlewares/multer.middleware");
const application_controller_1 = __importDefault(require("../../controllers/application.controller"));
const router = (0, express_1.Router)();
router.post("/", multer_middleware_1.upload.single("resume"), auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("CANDIDATE"), application_controller_1.default.createApplication);
router.get("/", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("CANDIDATE", "ADMIN"), application_controller_1.default.getAllApplicationsForJob);
// router.patch("/",auth.auth,auth.authorizeRole("CANDIDATE"),applicationController.updateApplication);
exports.default = router;
