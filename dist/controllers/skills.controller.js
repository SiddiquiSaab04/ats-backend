"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSkillsController = void 0;
const skills_service_1 = require("../services/skills.service");
const client_1 = require("../prisma/client");
const AppError_1 = require("../utils/AppError");
const createSkillsController = async (req, res, next) => {
    const { name } = req.body;
    try {
        if (!name) {
            throw new AppError_1.AppError("Skills name is required", 400);
        }
        const alreadyExists = await client_1.prisma.skill.findFirst({
            where: {
                name
            }
        });
        if (alreadyExists) {
            throw new AppError_1.AppError("Skills already exists", 400);
        }
        const skills = await (0, skills_service_1.createSkillsService)(name);
        if (!skills) {
            throw new AppError_1.AppError("Skills not created", 400);
        }
        return res.status(201).json({
            success: true,
            message: "Skills created successfully",
            data: skills
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSkillsController = createSkillsController;
