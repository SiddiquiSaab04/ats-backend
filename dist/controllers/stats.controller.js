"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_services_1 = __importDefault(require("../services/stats.services"));
const AppError_1 = require("../utils/AppError");
const getStatsForCandidate = async (req, res) => {
    try {
        const candidateId = Number(req.user?.id);
        if (!candidateId) {
            throw new AppError_1.AppError("Unauthorized", 401);
        }
        const result = await stats_services_1.default.getStatsForCandidate(candidateId);
        return res.status(200).json({ message: "Stats for candidate fetched successfully", data: result });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch stats for candidate", error });
    }
};
exports.default = {
    getStatsForCandidate
};
