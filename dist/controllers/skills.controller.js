"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkillsController = exports.updateSkillsController = exports.getAllSkillsController = exports.createSkillsController = void 0;
const skills_service_1 = require("../services/skills.service");
const client_1 = require("../prisma/client");
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
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
const getAllSkillsController = async (req, res, next) => {
    try {
        const { page, limit, search } = (0, pagination_1.parsePaginationQuery)(req);
        const result = await (0, skills_service_1.getSkillsService)(page, limit, search);
        return res.status(200).json({
            success: true,
            message: "Skills fetched successfully",
            ...result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllSkillsController = getAllSkillsController;
const updateSkillsController = async (req, res, next) => {
    const { name } = req.body;
    const id = Number(req.params.id);
    try {
        if (!name || !id) {
            throw new AppError_1.AppError("Skills id and name is required", 400);
        }
        const skills = await (0, skills_service_1.updateSkillsService)(id, name);
        if (!skills) {
            throw new AppError_1.AppError("Skills not updated", 400);
        }
        return res.status(200).json({
            success: true,
            message: "Skills updated successfully",
            data: skills
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSkillsController = updateSkillsController;
const deleteSkillsController = async (req, res, next) => {
    const id = Number(req.params.id);
    try {
        if (!id) {
            throw new AppError_1.AppError("Skills id is required", 400);
        }
        const skills = await (0, skills_service_1.deleteSkillsService)(id);
        if (!skills) {
            throw new AppError_1.AppError("Skills not deleted", 400);
        }
        return res.status(200).json({
            success: true,
            message: "Skills deleted successfully",
            data: skills
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSkillsController = deleteSkillsController;
