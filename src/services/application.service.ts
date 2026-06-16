import { prisma } from "../prisma/client";
import { Request , NextFunction, Response } from "express";
const createApplication = async (data: any) => {
    try {
        const application = await prisma.application.create({
            data: {
                ...data
            }
        });
        return application;
    } catch (error) {
        throw error;
    }
}

export default {
    createApplication
}