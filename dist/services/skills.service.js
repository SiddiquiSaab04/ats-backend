"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkillsService = exports.updateSkillsService = exports.getSkillsService = exports.createSkillsService = void 0;
const client_1 = require("../prisma/client");
const client_2 = require("../redis/client");
const pagination_1 = require("../utils/pagination");
const clearSkillsCache = async () => {
    try {
        const keys = await client_2.redisClient.keys("skills:*");
        if (keys.length > 0) {
            await client_2.redisClient.del(keys);
        }
    }
    catch (error) {
        console.error("Failed to clear skills cache:", error);
    }
};
const createSkillsService = async (name) => {
    try {
        const skills = await client_1.prisma.skill.create({
            data: {
                name
            }
        });
        await clearSkillsCache();
        return skills;
    }
    catch (error) {
        throw error;
    }
};
exports.createSkillsService = createSkillsService;
const getSkillsService = async (page = 1, limit = 10, search = "") => {
    try {
        const cacheKey = `skills:${page}:${limit}:${search || "all"}`;
        const cachedSkills = await client_2.redisClient.get(cacheKey);
        if (cachedSkills) {
            return JSON.parse(cachedSkills);
        }
        const result = await (0, pagination_1.paginate)(client_1.prisma.skill, {
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
                id: 'asc'
            }
        });
        await client_2.redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 60 * 2 // 2 minutes cache
        });
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.getSkillsService = getSkillsService;
const updateSkillsService = async (id, name) => {
    try {
        const skills = await client_1.prisma.skill.update({
            where: {
                id
            },
            data: {
                name
            }
        });
        await clearSkillsCache();
        return skills;
    }
    catch (error) {
        throw error;
    }
};
exports.updateSkillsService = updateSkillsService;
const deleteSkillsService = async (id) => {
    try {
        const skills = await client_1.prisma.skill.delete({
            where: {
                id
            }
        });
        await clearSkillsCache();
        return skills;
    }
    catch (error) {
        throw error;
    }
};
exports.deleteSkillsService = deleteSkillsService;
