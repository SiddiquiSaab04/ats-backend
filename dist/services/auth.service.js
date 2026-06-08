"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const signup = async (req) => {
    const { name, email, password, role } = req.body;
    const saltRounds = 12;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    const existingUser = await client_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const user = await client_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        }
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
exports.default = {
    signup,
};
