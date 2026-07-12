import { Request, Response, NextFunction } from "express";
import statsService from "../services/stats.service"
import { AppError } from "../utils/AppError";

const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.id);
        const role = (req as any).user?.role;
        if (!userId || !role) {
            throw new AppError("Unauthorized", 401);
        }
        const result = await statsService.getStats(userId, role);
        return res.status(200).json({
            message: `Stats for ${role.toLowerCase()} fetched successfully`,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export default {
    getStats
}

