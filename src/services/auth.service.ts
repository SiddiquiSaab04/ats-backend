import { prisma } from "../prisma/client";
import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

const signup = async(req:Request) => {
    const {name , email , password , role} = req.body;
    const saltRounds = 12 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUser = await prisma.user.findUnique({where: {email}});
    if(existingUser){
        throw new AppError("User already exists", 400);
    }
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword,
            role,
        }
    })
    
    const token = jwt.sign({id: user.id, email: user.email, role: user.role}, process.env.JWT_SECRETKEY!, {expiresIn: "1h"});

    return {
        id:user.id,
        token,
        name:user.name,
        email:user.email,
        role:user.role,
        createdAt:user.createdAt,
        updatedAt:user.updatedAt
    };
}

const login = async(req:Request) => {
    const {email , password} = req.body;
    const existingUser = await prisma.user.findUnique({where: {email}});
    if(!existingUser){
        throw new AppError("User not found", 404);
    }
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if(!validPassword){
        throw new AppError("Invalid password", 401);
    }
    const token = jwt.sign({id:existingUser.id ,email , role: existingUser.role} , process.env.JWT_SECRETKEY! , {expiresIn: "1h"});
    return {
        id:existingUser.id,
        token,
        name:existingUser.name,
        email:existingUser.email,
        role:existingUser.role,
        createdAt:existingUser.createdAt,
        updatedAt:existingUser.updatedAt
    };
}

export default {
    signup,
    login
}