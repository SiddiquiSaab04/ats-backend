"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../../controllers/user.controller"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("CANDIDATE", "RECRUITER", "ADMIN"), user_controller_1.default.getCurrentUser);
router.get("/", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("ADMIN"), user_controller_1.default.getAllUsers);
exports.default = router;
