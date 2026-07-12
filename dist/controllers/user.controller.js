"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const pagination_1 = require("../utils/pagination");
const getAllUsers = async (req, res) => {
    try {
        const { page, limit, search } = (0, pagination_1.parsePaginationQuery)(req);
        const result = await user_service_1.default.getAllUsers(page, limit, search);
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            ...result
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Error fetching users" });
    }
};
const getCurrentUser = async (req, res) => {
    try {
        const email = req.user?.email;
        const user = await user_service_1.default.getCurrentUser(email);
        return res.status(200).json({ success: true, message: "User fetched successfully", user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Error fetching user" });
    }
};
exports.default = {
    getAllUsers,
    getCurrentUser,
};
