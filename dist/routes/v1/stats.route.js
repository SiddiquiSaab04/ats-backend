"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const stats_controller_1 = __importDefault(require("../../controllers/stats.controller"));
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default.auth, stats_controller_1.default.getStats);
exports.default = router;
