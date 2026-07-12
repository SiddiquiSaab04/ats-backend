"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_service_1 = __importDefault(require("../services/stats.service"));
const AppError_1 = require("../utils/AppError");
const getStats = async (req, res, next) => {
    try {
        const userId = Number(req.user?.id);
        const role = req.user?.role;
        if (!userId || !role) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const result = await stats_service_1.default.getStats(userId, role);
        return res.status(200).json({
            message: `Stats for ${role.toLowerCase()} fetched successfully`,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getStats
};
