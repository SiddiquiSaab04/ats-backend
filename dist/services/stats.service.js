"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const AppError_1 = require("../utils/AppError");
const getStats = async (userId, role) => {
    try {
        if (role === "CANDIDATE") {
            const stats = await client_1.prisma.application.groupBy({
                by: ["status"],
                where: {
                    candidateId: userId
                },
                _count: {
                    status: true
                }
            });
            const totalApplications = await client_1.prisma.application.count({
                where: {
                    candidateId: userId
                }
            });
            const formattedStats = {
                TOTAL_APPLICATIONS: totalApplications,
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
            return Object.entries(formattedStats).map(([key, value]) => ({
                title: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
                value
            }));
        }
        if (role === "RECRUITER") {
            const totalJobs = await client_1.prisma.job.count({
                where: {
                    createdBy: userId
                }
            });
            const jobsStats = await client_1.prisma.job.groupBy({
                by: ["status"],
                where: {
                    createdBy: userId
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
                            in: ["DECLINED", "APPLIED", "PENDING", "ACCEPTED", "SHORTLISTED"]
                        }
                    },
                    job: {
                        createdBy: userId
                    }
                },
                _count: {
                    status: true
                }
            });
            const jobStatusStats = {
                OPEN: 0,
                CLOSED: 0,
                EXPIRED: 0,
            };
            jobsStats.forEach(stat => {
                const statusKey = stat.status;
                if (statusKey in jobStatusStats) {
                    jobStatusStats[statusKey] = stat._count.status;
                }
            });
            const appStatusStats = {
                REJECTED: 0,
                INTERVIEW: 0,
                OFFERED: 0,
            };
            totalApplications.forEach(stat => {
                const statusKey = stat.status;
                if (statusKey in appStatusStats) {
                    appStatusStats[statusKey] = stat._count.status;
                }
            });
            return [
                { title: "Total Jobs", value: totalJobs },
                { title: "Open Jobs", value: jobStatusStats.OPEN },
                { title: "Closed Jobs", value: jobStatusStats.CLOSED },
                { title: "Expired Jobs", value: jobStatusStats.EXPIRED },
                { title: "Rejected Applications", value: appStatusStats.REJECTED },
                { title: "Interview Applications", value: appStatusStats.INTERVIEW },
                { title: "Offered Applications", value: appStatusStats.OFFERED }
            ];
        }
        if (role === "ADMIN") {
            const totalJobs = await client_1.prisma.job.count();
            const totalApplications = await client_1.prisma.application.count();
            const totalHired = await client_1.prisma.application.count({
                where: {
                    status: "OFFERED"
                }
            });
            const totalCompanies = await client_1.prisma.company.count();
            const totalUsers = await client_1.prisma.user.groupBy({
                by: ["role"],
                where: {
                    role: {
                        notIn: ["ADMIN"]
                    }
                },
                _count: {
                    role: true
                }
            });
            const userRoleStats = {
                CANDIDATE: 0,
                RECRUITER: 0,
            };
            totalUsers.forEach(stat => {
                const roleKey = stat.role;
                if (roleKey in userRoleStats) {
                    userRoleStats[roleKey] = stat._count.role;
                }
            });
            return [
                { title: "Total Jobs", value: totalJobs },
                { title: "Total Applications", value: totalApplications },
                { title: "Total Companies", value: totalCompanies },
                { title: "Total Hired", value: totalHired },
                { title: "Candidate Users", value: userRoleStats.CANDIDATE },
                { title: "Recruiter Users", value: userRoleStats.RECRUITER }
            ];
        }
        throw new AppError_1.AppError("Invalid role", 400);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw new AppError_1.AppError(`Failed to fetch stats for ${role.toLowerCase()}`, 500);
    }
};
exports.default = {
    getStats
};
