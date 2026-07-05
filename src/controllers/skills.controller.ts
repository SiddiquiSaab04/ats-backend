import { Request , Response , NextFunction } from "express";
import {createSkillsService , getSkillsService , updateSkillsService , deleteSkillsService } from "../services/skills.service";
import {prisma} from "../prisma/client";
import { AppError } from "../utils/AppError";
import { parsePaginationQuery } from "../utils/pagination";
import { createSkillSchema, updateSkillSchema, skillIdSchema } from "../validators/skills/skills.validation";

const createSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const validationResult = createSkillSchema.safeParse(req.body);
        if(!validationResult.success){
            throw new AppError(validationResult.error.issues[0].message, 400);
        }
        const { name } = validationResult.data;
        const alreadyExists = await prisma.skill.findFirst({
            where: {
                name
            }
        });
        if(alreadyExists){
            throw new AppError("Skills already exists", 400);
        }
        const skills = await createSkillsService(name);
        if(!skills){
            throw new AppError("Skills not created", 400);
        }
        return res.status(201).json({
            success: true,
            message: "Skills created successfully",
            data: skills
        });
    } catch (error) {
        next(error);
    }
}

const getAllSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const { page, limit, search } = parsePaginationQuery(req);
        const result = await getSkillsService(page, limit, search);
        return res.status(200).json({
            success: true,
            message: "Skills fetched successfully",
            ...result
        });
    } catch (error) {
        next(error);
    }
}

const updateSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const paramValidation = skillIdSchema.safeParse(req.params);
        if(!paramValidation.success){
            throw new AppError(paramValidation.error.issues[0].message, 400);
        }
        const bodyValidation = updateSkillSchema.safeParse(req.body);
        if(!bodyValidation.success){
            throw new AppError(bodyValidation.error.issues[0].message, 400);
        }
        const { id } = paramValidation.data;
        const { name } = bodyValidation.data;

        const skills = await updateSkillsService(id, name);
        if(!skills){
            throw new AppError("Skills not updated", 400);
        }
        return res.status(200).json({
            success: true,
            message: "Skills updated successfully",
            data: skills
        });
    } catch (error) {
        next(error);
    }
}

const deleteSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const paramValidation = skillIdSchema.safeParse(req.params);
        if(!paramValidation.success){
            throw new AppError(paramValidation.error.issues[0].message, 400);
        }
        const { id } = paramValidation.data;
        const skills = await deleteSkillsService(id);
        if(!skills){
            throw new AppError("Skills not deleted", 400);
        }
        return res.status(200).json({
            success: true,
            message: "Skills deleted successfully",
            data: skills
        });
    } catch (error) {
        next(error);
    }
}

export {
    createSkillsController,
    getAllSkillsController,
    updateSkillsController,
    deleteSkillsController
}