import {Request, Response} from "express";
import statsService from "../services/stats.services"
import { AppError } from "../utils/AppError";
const getStatsForCandidate = async (req : Request, res : Response) => {
    try {
        const candidateId = Number((req as any).user ?. id);
        if(!candidateId){
            throw new AppError("Unauthorized",401);
        }
        const result = await statsService.getStatsForCandidate(candidateId);
        return res.status(200).json({message: "Stats for candidate fetched successfully", data: result});
    } catch (error) {
        return res.status(500).json({message: "Failed to fetch stats for candidate", error});
    }
}


export default {
    getStatsForCandidate
}
