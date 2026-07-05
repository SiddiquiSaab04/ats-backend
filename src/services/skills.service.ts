import { prisma } from "../prisma/client";

const createSkillsService = async (name: string) => {
    try {
    const skills = await prisma.skill.create({
        data: {
            name
        }
    });
    return skills;
    } catch (error) {
        throw error;
    }
}

export {
    createSkillsService
}
