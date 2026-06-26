import { prisma } from "../prisma/client";

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
        throw error;
    }
}


export default {
    getStatsForCandidate
}