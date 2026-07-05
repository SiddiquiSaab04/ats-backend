import { Request , Response , NextFunction } from "express";
import {createSkillsService , getSkillsService , updateSkillsService , deleteSkillsService } from "../services/skills.service";
import {prisma} from "../prisma/client";
import { AppError } from "../utils/AppError";

const createSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    const {name} = req.body;
    try {
        if(!name){
            throw new AppError("Skills name is required", 400);
        }
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
        const skills = await getSkillsService();
        return res.status(200).json({
            success: true,
            message: "Skills fetched successfully",
            data: skills
        });
    } catch (error) {
        next(error);
    }
}

const updateSkillsController = async (req:Request, res:Response, next:NextFunction) => {
    const {name} = req.body;
    const id = Number(req.params.id);
    try {
        if(!name || !id){
            throw new AppError("Skills id and name is required", 400);
        }
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
    const id = Number(req.params.id);
    try {
        if(!id){
            throw new AppError("Skills id is required", 400);
        }
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