import { prisma } from "../prisma/client";
import { paginate } from "../utils/pagination";

const getAllUsers = async (page: number = 1, limit: number = 10, search = "") => {
    const result = await paginate(prisma.user, {
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
            createdAt: "asc"
        }
    });

    return result;
}

const getCurrentUser = async (email:string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });
    if(!user){
        throw new Error("User not found");
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export default {
    getAllUsers,
    getCurrentUser,
}