"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const pagination_1 = require("../utils/pagination");
const getAllUsers = async (page = 1, limit = 10, search = "") => {
    const result = await (0, pagination_1.paginate)(client_1.prisma.user, {
        page,
        limit,
        search
    }, {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
        where: search ? {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        } : undefined,
        orderBy: {
            createdAt: "desc"
        }
    });
    return result;
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
