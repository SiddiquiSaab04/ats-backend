"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_service_1 = __importDefault(require("../services/analytics.service"));
const AppError_1 = require("../utils/AppError");
const getAnalytics = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        if (!id || !role) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const analytics = await analytics_service_1.default.getAnalytics(id, role);
        return res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getAnalytics
};
