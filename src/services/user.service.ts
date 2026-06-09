import { prisma } from "../prisma/client";

const getAllUsers = async () => {
    const users =  await prisma.user.findMany();
    return users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    })
}

export default {
    getAllUsers,
}