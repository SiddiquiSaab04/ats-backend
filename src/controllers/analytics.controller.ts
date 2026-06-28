import { Request , Response , NextFunction } from "express";
import analyticsService from "../services/analytics.service";
import { AppError } from "../utils/AppError";

const getAnalyticsForCandidate = async(req:Request , res:Response , next:NextFunction) => {
    try {
        const {id , role} = (req as any).user;
        if(role !== "CANDIDATE"){
            throw new AppError("Unauthorized", 401);
        }
        const analytics = await analyticsService.getAnalyticsForCandidate(id);
        return res.status(200).json({
            success: true,
            data: analytics
        })
    } catch (error : any) {
        throw new AppError(error.message , 400)
    }
}

const getAnalyticsForRecruiter = async(req:Request , res:Response , next:NextFunction) => {
    try {
        const analytics = await analyticsService.getAnalyticsForRecruiter(req);
        res.status(200).json({
            success: true,
            data: analytics
        })
    } catch (error) {
        
    }
}

const getAnalyticsForAdmin = async(req:Request , res:Response , next:NextFunction) => {
    try {
        const analytics = await analyticsService.getAnalyticsForAdmin(req);
        res.status(200).json({
            success: true,
            data: analytics
        })
    } catch (error) {
        
    }
}

export default {
    getAnalyticsForCandidate,
    getAnalyticsForRecruiter,
    getAnalyticsForAdmin
}