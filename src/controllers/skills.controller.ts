import { Request , Response , NextFunction } from "express";
import {createSkillsService} from "../services/skills.service";
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

export {
    createSkillsController
}