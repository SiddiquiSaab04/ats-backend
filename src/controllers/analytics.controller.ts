import { Request, Response, NextFunction } from "express";
import analyticsService from "../services/analytics.service";
import { AppError } from "../utils/AppError";

const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = (req as any).user;
        if (!id || !role) {
            throw new AppError("Unauthorized", 401);
        }
        const analytics = await analyticsService.getAnalytics(id, role);
        return res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error: any) {
        next(error);
    }
}

export default {
    getAnalytics
}