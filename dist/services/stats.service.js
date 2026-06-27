"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const AppError_1 = require("../utils/AppError");
const getStatsForCandidate = async (candidateId) => {
    try {
        const stats = await client_1.prisma.application.groupBy({
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
            const statusKey = stat.status;
            if (statusKey in formattedStats) {
                formattedStats[statusKey] = stat._count.status;
            }
        });
        return formattedStats;
    }
    catch (error) {
        throw new AppError_1.AppError("Failed to fetch stats for candidate", 500);
    }
};
const getStatsForRecruiter = async (recruiterId) => {
    try {
        const totalJobsPosted = await client_1.prisma.job.groupBy({
            by: ["status"],
            where: {
                createdBy: recruiterId
            },
            _count: {
                status: true
            }
        });
        const totalApplications = await client_1.prisma.application.groupBy({
            by: ["status"],
            where: {
                NOT: {
                    status: {
                        in: ["DECLINED", "APPLIED"]
                    }
                },
                job: {
                    createdBy: recruiterId
                }
            },
            _count: {
                status: true
            }
        });
        const formattedStats = {
            OPEN: 0,
            CLOSED: 0,
            EXPIRED: 0,
        };
        totalJobsPosted.forEach(stat => {
            const statusKey = stat.status;
            if (statusKey in formattedStats) {
                formattedStats[statusKey] = stat._count.status;
            }
        });
        const formattedApplications = {
            SHORTLISTED: 0,
            REJECTED: 0,
            INTERVIEW: 0,
            OFFERED: 0,
            ACCEPTED: 0,
            DECLINED: 0,
        };
        totalApplications.forEach(stat => {
            const statusKey = stat.status;
            if (statusKey in formattedApplications) {
                formattedApplications[statusKey] = stat._count.status;
            }
        });
        return {
            totalJobsPosted: formattedStats,
            totalApplications: formattedApplications
        };
    }
    catch (error) {
        throw new AppError_1.AppError("Failed to fetch stats for recruiter", 500);
    }
};
exports.default = {
    getStatsForCandidate,
    getStatsForRecruiter
};
