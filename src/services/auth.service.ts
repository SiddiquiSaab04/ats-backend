import { prisma } from "../prisma/client";
import { Request } from "express";
import bcrypt from "bcrypt";

const signup = async(req:Request) => {
    const {name , email , password , role} = req.body;
    const saltRounds = 12 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUser = await prisma.user.findUnique({where: {email}});
    if(existingUser){
        throw new Error("User already exists");
    }
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword,
            role,
        }
    })
    
    return {
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role,
        createdAt:user.createdAt,
        updatedAt:user.updatedAt
    };
}

export default {
    signup,
}