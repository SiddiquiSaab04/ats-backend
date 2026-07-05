"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSkillsService = void 0;
const client_1 = require("../prisma/client");
const createSkillsService = async (name) => {
    try {
        const skills = await client_1.prisma.skill.create({
            data: {
                name
            }
        });
        return skills;
    }
    catch (error) {
        throw error;
    }
};
exports.createSkillsService = createSkillsService;
