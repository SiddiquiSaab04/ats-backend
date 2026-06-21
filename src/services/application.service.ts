import { prisma } from "../prisma/client";
import { Request , NextFunction, Response } from "express";
import supabase from "../config/supabase";
const createApplication = async (data: any) => {
    try {

        const uploadResume = await supabase.storage.from("ATS").upload(`resume_${data.candidateId}_${Date.now()}.pdf`, data.resume);

        if (uploadResume.error) {
            throw uploadResume.error;
        }

        const application = await prisma.application.create({
            data:{
                candidateId:data.candidateId,
                jobId:Number(data.jobId),
                userName:data.userName,
                jobTitle:data.jobTitle,
                email:data.email,
                phone:data.phone,
                location:data.location,
                resumeUrl:uploadResume.data.path,
                coverLetter:data.coverLetter,
                status:data.status,
            }
        })
        console.log("application created successfully");
        return application;
    } catch (error) {
        console.log("error in creating application", error);
        throw error;
    }
}

export default {
    createApplication
}