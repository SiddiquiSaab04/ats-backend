"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const getAllUsers = async (req, res) => {
    try {
        const users = await user_service_1.default.getAllUsers();
        return res.status(200).json({ success: true, message: "Users fetched successfully", users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Error fetching users" });
    }
};
exports.default = {
    getAllUsers,
};
