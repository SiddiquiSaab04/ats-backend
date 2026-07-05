import { prisma } from "../prisma/client";
import { redisClient } from "../redis/client";
import { paginate } from "../utils/pagination";

const clearSkillsCache = async () => {
    try {
        const keys = await redisClient.keys("skills:*");
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error("Failed to clear skills cache:", error);
    }
};

const createSkillsService = async (name: string) => {
    try {
        const skills = await prisma.skill.create({
            data: {
                name
            }
        });
        await clearSkillsCache();
        return skills;
    } catch (error) {
        throw error;
    }
}

const getSkillsService = async (page: number = 1, limit: number = 10, search = "") => {
    try {
        const cacheKey = `skills:${page}:${limit}:${search || "all"}`;
        
        const cachedSkills = await redisClient.get(cacheKey);
        if (cachedSkills) {
            return JSON.parse(cachedSkills);
        }

        const result = await paginate(prisma.skill, {
            page,
            limit,
            search
        }, {
            where: search ? {
                name: {
                    contains: search
                }
            } : undefined,
            orderBy: {
                id:'asc'
            }
        });

        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 60 * 2 // 2 minutes cache
        });

        return result;
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
        await clearSkillsCache();
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
        await clearSkillsCache();
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
