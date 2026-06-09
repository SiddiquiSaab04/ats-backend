"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const getAllUsers = async () => {
    const users = await client_1.prisma.user.findMany();
    return users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    });
};
const getCurrentUser = async (email) => {
    const user = await client_1.prisma.user.findUnique({
        where: {
            email: email,
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.default = {
    getAllUsers,
    getCurrentUser,
};
