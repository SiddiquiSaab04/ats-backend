"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const signupUser = await auth_service_1.default.signup(req);
        if (!signupUser) {
            return res.status(400).json({ success: false, message: "Error signing up" });
        }
        return res.status(200).json({ success: true, message: "User signed up successfully", user: signupUser });
    }
    catch (error) {
        console.log("Error signing up:", error);
        return res.status(500).json({ success: false, message: "Error signing up" });
    }
};
exports.default = {
    signup,
};
