"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const analytics_controller_1 = __importDefault(require("../../controllers/analytics.controller"));
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default.auth, analytics_controller_1.default.getAnalytics);
exports.default = router;
