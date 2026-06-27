import {Request, Response, NextFunction} from "express";
import statsService from "../services/stats.service"
import { AppError } from "../utils/AppError";

const getStatsForCandidate = async (req : Request, res : Response, next:NextFunction) => {
    try {
        const candidateId = Number((req as any).user ?. id);
        if(!candidateId){
            throw new AppError("Unauthorized",401);
        }
        const result = await statsService.getStatsForCandidate(candidateId);
        return res.status(200).json({message: "Stats for candidate fetched successfully", data: result});
    } catch (error) {
        next(error);
    }
}


const getStatsForRecruiter = async (req : Request, res : Response, next:NextFunction) => {
    try {
        const recruiterId = Number((req as any).user ?. id);
        if(!recruiterId){
            throw new AppError("Unauthorized",401);
        }
        const result = await statsService.getStatsForRecruiter(recruiterId);
        return res.status(200).json({message: "Stats for recruiter fetched successfully", data: result});
    } catch (error) {
        next(error);
    }
}

const getStatsForAdmin = async (req : Request, res : Response, next:NextFunction) => {
    try {
        const adminId = Number((req as any).user ?. id);
        if(!adminId){
            throw new AppError("Unauthorized",401);
        }
        const result = await statsService.getStatsForAdmin();
        return res.status(200).json({message: "Stats for admin fetched successfully", data: result});
    } catch (error) {
        next(error);
    }
}

export default {
    getStatsForCandidate,
    getStatsForRecruiter,
    getStatsForAdmin
}
