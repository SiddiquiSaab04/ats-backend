"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const getAllUsers = async () => {
    const users = await client_1.prisma.user.findMany();
    console.log(users);
    return users;
};
exports.default = {
    getAllUsers,
};
