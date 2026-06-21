"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = __importDefault(require("./v1/user.route"));
const auth_route_1 = __importDefault(require("./v1/auth.route"));
const job_route_1 = __importDefault(require("./v1/job.route"));
const application_route_1 = __importDefault(require("./v1/application.route"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.use("/user", user_route_1.default);
router.use("/auth", auth_route_1.default);
router.use("/job", job_route_1.default);
router.use("/application", application_route_1.default);
exports.default = router;
