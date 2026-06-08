"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("--- DEBUG START ---");
        console.log("Token Extracted:", token);
        if (!token) {
            console.log("Result: Token nahi mila, block running");
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        console.log("Secret Key Checked:", process.env.JWT_SECRETKEY ? "Key Maujood Hai" : "Key MISSING Hai!");
        // Token verify karne ki koshish
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRETKEY);
        console.log("Token Decoded Successfully:", decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log("--- CATCH BLOCK TRIGGERED ---");
        console.log("Exact Error Message:", error.message); // Yeh batayega ke masla kya hai
        // Response mein asli wajah bhein taake Postman mein saaf dikhe
        return res.status(401).json({
            success: false,
            message: `Auth Failed: ${error.message}`
        });
    }
};
exports.default = {
    auth
};
