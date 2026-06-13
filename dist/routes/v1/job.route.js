"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const job_controller_1 = __importDefault(require("../../controllers/job.controller"));
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER", "ADMIN"), job_controller_1.default.createJob);
router.get("/", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER", "CANDIDATE", "ADMIN"), job_controller_1.default.getAllJobs);
router.get("/:id", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER", "CANDIDATE", "ADMIN"), job_controller_1.default.getJobById);
router.put("/:id", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER", "ADMIN"), job_controller_1.default.updateJob);
exports.default = router;
