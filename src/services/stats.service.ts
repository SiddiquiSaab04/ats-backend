import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

const getStatsForCandidate = async (candidateId: number) => {
    try {
        const stats = await prisma.application.groupBy({
            by: ["status"],
            where: {
                candidateId: candidateId
            },
            _count: {
                status: true
            }
        });

        const formattedStats = {
            APPLIED: 0,
            SHORTLISTED: 0,
            REJECTED: 0,
            INTERVIEW: 0,
            OFFERED: 0,
            ACCEPTED: 0,
            DECLINED: 0
        };

        stats.forEach(stat => {
            const statusKey = stat.status as keyof typeof formattedStats;
            if(statusKey in formattedStats){
                formattedStats[statusKey] = stat._count.status;
            }
        });

        return formattedStats;
    } catch (error) {
        throw new AppError("Failed to fetch stats for candidate", 500);
    }
}

const getStatsForRecruiter = async (recruiterId: number) => {
    try {
        const totalJobsPosted = await prisma.job.groupBy({
            by: ["status"],
            where: {
                createdBy: recruiterId
            },
            _count: {
                status: true
            }
        });

        const totalApplications = await prisma.application.groupBy({
            by: ["status"],
            where:{
                NOT: {
                    status: {
                        in: ["DECLINED", "APPLIED","PENDING","ACCEPTED","SHORTLISTED"]
                    }
                },
                job: {
                    createdBy: recruiterId
                }
            },
            _count: {
                status: true
            }
        })

    const formattedStats = {
        OPEN: 0,
        CLOSED: 0,
        EXPIRED: 0,
    };

    totalJobsPosted.forEach(stat => {
        const statusKey = stat.status as keyof typeof formattedStats;
        if(statusKey in formattedStats){
            formattedStats[statusKey] = stat._count.status;
        }
    });

    const formattedApplications = {
        REJECTED: 0,
        INTERVIEW: 0,
        OFFERED: 0,
    };

    totalApplications.forEach(stat => {
        const statusKey = stat.status as keyof typeof formattedApplications;
        if(statusKey in formattedApplications){
            formattedApplications[statusKey] = stat._count.status;
        }
    });

    return {
        totalJobsPosted: formattedStats,
        totalApplications: formattedApplications
    }
    } catch (error) {
        throw new AppError("Failed to fetch stats for recruiter", 500);
    }
}

const getStatsForAdmin = async (adminId: number) => {
    try {
        const totalJobs = await prisma.job.count();
        const totalApplications = await prisma.application.count();
        const totalHired = await prisma.application.count({
            where:{
                status: "OFFERED"
            }
        });
        const totalCompanies = await prisma.company.count();
        const totalUsers = await prisma.user.groupBy({
            by:["role"],
            _count:{
                role:true
            }
        });

        const formattedStats = {
            ADMIN: 0,
            CANDIDATE: 0,
            RECRUITER: 0,
        };

        totalUsers.forEach(stat => {
            const roleKey = stat.role as keyof typeof formattedStats;
            if(roleKey in formattedStats){
                formattedStats[roleKey] = stat._count.role;
            }
        });

        return {
            totalJobs,
            totalApplications,
            totalCompanies,
            totalHired,
            totalUsers: formattedStats
        }
    } catch (error) {
        throw new AppError("Failed to fetch stats for admin", 500);
    }
}


export default {
    getStatsForCandidate,
    getStatsForRecruiter,
    getStatsForAdmin
}