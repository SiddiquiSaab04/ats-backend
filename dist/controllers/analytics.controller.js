"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_service_1 = __importDefault(require("../services/analytics.service"));
const AppError_1 = require("../utils/AppError");
const getAnalyticsForCandidate = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        if (role !== "CANDIDATE") {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const analytics = await analytics_service_1.default.getAnalyticsForCandidate(id);
        return res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        throw new AppError_1.AppError(error.message, 400);
    }
};
const getAnalyticsForRecruiter = async (req, res, next) => {
    try {
        const analytics = await analytics_service_1.default.getAnalyticsForRecruiter(req);
        res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
    }
};
const getAnalyticsForAdmin = async (req, res, next) => {
    try {
        const analytics = await analytics_service_1.default.getAnalyticsForAdmin(req);
        res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
    }
};
exports.default = {
    getAnalyticsForCandidate,
    getAnalyticsForRecruiter,
    getAnalyticsForAdmin
};
