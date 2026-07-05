"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkillsController = exports.updateSkillsController = exports.getAllSkillsController = exports.createSkillsController = void 0;
const skills_service_1 = require("../services/skills.service");
const client_1 = require("../prisma/client");
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const skills_validation_1 = require("../validators/skills/skills.validation");
const createSkillsController = async (req, res, next) => {
    try {
        const validationResult = skills_validation_1.createSkillSchema.safeParse(req.body);
        if (!validationResult.success) {
            throw new AppError_1.AppError(validationResult.error.issues[0].message, 400);
        }
        const { name } = validationResult.data;
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
    try {
        const paramValidation = skills_validation_1.skillIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError_1.AppError(paramValidation.error.issues[0].message, 400);
        }
        const bodyValidation = skills_validation_1.updateSkillSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new AppError_1.AppError(bodyValidation.error.issues[0].message, 400);
        }
        const { id } = paramValidation.data;
        const { name } = bodyValidation.data;
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
    try {
        const paramValidation = skills_validation_1.skillIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError_1.AppError(paramValidation.error.issues[0].message, 400);
        }
        const { id } = paramValidation.data;
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
