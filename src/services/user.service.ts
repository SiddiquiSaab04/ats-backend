import { prisma } from "../prisma/client";

const getAllUsers = async () => {
    const users =  await prisma.user.findMany();
    console.log(users);
    return users;
}

export default {
    getAllUsers,
}