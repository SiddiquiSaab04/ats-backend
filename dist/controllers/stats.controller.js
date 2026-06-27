"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_service_1 = __importDefault(require("../services/stats.service"));
const AppError_1 = require("../utils/AppError");
const getStatsForCandidate = async (req, res, next) => {
    try {
        const candidateId = Number(req.user?.id);
        if (!candidateId) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const result = await stats_service_1.default.getStatsForCandidate(candidateId);
        return res.status(200).json({ message: "Stats for candidate fetched successfully", data: result });
    }
    catch (error) {
        next(error);
    }
};
const getStatsForRecruiter = async (req, res, next) => {
    try {
        const recruiterId = Number(req.user?.id);
        if (!recruiterId) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const result = await stats_service_1.default.getStatsForRecruiter(recruiterId);
        return res.status(200).json({ message: "Stats for recruiter fetched successfully", data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getStatsForCandidate,
    getStatsForRecruiter
};
