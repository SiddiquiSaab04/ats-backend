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

const getSkillsService = async () => {
    try {
        const skills = await prisma.skill.findMany();
        return skills;
    } catch (error) {
        throw error;
    }
}

const updateSkillsService = async (id: number, name: string) => {
    try {
        const skills = await prisma.skill.update({
            where: {
                id
            },
            data: {
                name
            }
        });
        return skills;
    } catch (error) {
        throw error;
    }
}

const deleteSkillsService = async (id: number) => {
    try {
        const skills = await prisma.skill.delete({
            where: {
                id
            }
        });
        return skills;
    } catch (error) {
        throw error;
    }
}

export {
    createSkillsService,
    getSkillsService,
    updateSkillsService,
    deleteSkillsService
}
