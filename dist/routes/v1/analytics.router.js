"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const analytics_controller_1 = __importDefault(require("../../controllers/analytics.controller"));
const router = (0, express_1.Router)();
router.get("/candidate", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("CANDIDATE"), analytics_controller_1.default.getAnalyticsForCandidate);
router.get("/recruiter", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("RECRUITER"), analytics_controller_1.default.getAnalyticsForRecruiter);
router.get("/admin", auth_middleware_1.default.auth, auth_middleware_1.default.authorizeRole("ADMIN"), analytics_controller_1.default.getAnalyticsForAdmin);
exports.default = router;
