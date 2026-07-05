"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const skills_controller_1 = require("../../controllers/skills.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER", "CANDIDATE"), skills_controller_1.createSkillsController);
exports.default = router;
