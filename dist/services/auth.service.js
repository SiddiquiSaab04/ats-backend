"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const signup = async (req) => {
    const { name, email, password, role } = req.body;
    const saltRounds = 12;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    const existingUser = await client_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.AppError("User already exists", 400);
    }
    const user = await client_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        }
    });
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRETKEY, { expiresIn: "1h" });
    return {
        id: user.id,
        token,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
const login = async (req) => {
    const { email, password } = req.body;
    const existingUser = await client_1.prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const validPassword = await bcrypt_1.default.compare(password, existingUser.password);
    if (!validPassword) {
        throw new AppError_1.AppError("Invalid password", 401);
    }
    const token = jsonwebtoken_1.default.sign({ id: existingUser.id, email, role: existingUser.role }, process.env.JWT_SECRETKEY, { expiresIn: "1h" });
    return {
        id: existingUser.id,
        token,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt
    };
};
exports.default = {
    signup,
    login
};
