"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/client");
const moment_1 = __importDefault(require("moment"));
const getAnalyticsForCandidate = async (id) => {
    try {
        const rawAnalytics = await client_1.prisma.$queryRaw `
        SELECT
        DATE_FORMAT(appliedAt, '%b %Y') AS month,
        COUNT(*) AS total
        FROM Application
        WHERE candidateId = ${id}
        AND appliedAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
        AND appliedAt <= NOW()
        GROUP BY DATE_FORMAT(appliedAt, '%Y-%m'), DATE_FORMAT(appliedAt, '%b %Y')
        ORDER BY DATE_FORMAT(appliedAt, '%Y-%m');
        `;
        const analytics = rawAnalytics.map(row => ({
            month: row.month,
            total: Number(row.total)
        }));
        const currentMonthIndex = (0, moment_1.default)().month();
        const currentYearStr = (0, moment_1.default)().format('YYYY');
        const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const finalAnalytics = allMonths.slice(0, currentMonthIndex + 1).map(m => {
            const monthStr = `${m} ${currentYearStr}`;
            const found = analytics.find(a => a.month === monthStr);
            return {
                month: monthStr,
                total: found ? found.total : 0
            };
        });
        const offeredApplicants = await client_1.prisma.application.count({
            where: {
                candidateId: id,
                status: "OFFERED"
            }
        });
        const totalApplicants = await client_1.prisma.application.count({
            where: {
                candidateId: id,
            }
        });
        const successRate = totalApplicants === 0 ? 0 : (offeredApplicants / totalApplicants) * 100;
        const recentActivity = await client_1.prisma.application.findMany({
            where: {
                candidateId: id,
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            take: 10,
            orderBy: {
                appliedAt: "desc"
            }
        });
        const formattedRecentActivities = recentActivity.map(activity => ({
            jobTitle: activity.job.title,
            companyName: activity.job.company.name,
            appliedAt: (0, moment_1.default)(activity.appliedAt).format('DD MMM YYYY'),
            status: activity.status
        }));
        return {
            totalApplications: finalAnalytics,
            offeredApplicants,
            successRate,
            recentActivity: formattedRecentActivities
        };
    }
    catch (error) {
        throw error;
    }
};
const getAnalyticsForRecruiter = async (req) => {
    return {};
};
const getAnalyticsForAdmin = async (req) => {
    return {};
};
exports.default = {
    getAnalyticsForCandidate,
    getAnalyticsForRecruiter,
    getAnalyticsForAdmin
};
