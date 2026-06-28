import {prisma} from "../prisma/client";
import moment from "moment";


const allMonths = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

const getAnalyticsForCandidate = async (id : number) => {
    try {
        const rawAnalytics = await prisma.$queryRaw<any[]> `
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

        const currentMonthIndex = moment().month();
        const currentYearStr = moment().format('YYYY');

        const finalAnalytics = allMonths.slice(0, currentMonthIndex + 1).map(m => {
            const monthStr = `${m} ${currentYearStr}`;
            const found = analytics.find(a => a.month === monthStr);
            return {
                month: monthStr,
                total: found ? found.total : 0
            };
        });

        const offeredApplicants = await prisma.application.count({
            where: {
                candidateId: id,
                status: "OFFERED"
            }
        })

        const totalApplicants = await prisma.application.count({
            where: {
                candidateId: id
            }
        })

        const successRate = totalApplicants === 0 ? 0 : (offeredApplicants / totalApplicants) * 100;

        const recentActivity = await prisma.application.findMany({
            where: {
                candidateId: id
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
        })

        const formattedRecentActivities = recentActivity.map(activity => ({
            jobTitle: activity.job.title,
            companyName: activity.job.company.name,
            appliedAt: moment(activity.appliedAt).format('DD MMM YYYY'),
            status: activity.status
        }))

        return {totalApplications: finalAnalytics, offeredApplicants, successRate, recentActivity: formattedRecentActivities}
    } catch (error) {
        throw error;
    }
}

const getAnalyticsForRecruiter = async (id : number) => {
    try {
        const rawAnalytics = await prisma.$queryRaw<any[]> `
            SELECT
            DATE_FORMAT(a.appliedAt, '%b %Y') AS month,
            COUNT(*) AS total
            FROM Application a
            JOIN Job j ON a.jobId = j.id
            WHERE j.createdBy = ${id}
            AND a.appliedAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
            AND a.appliedAt <= NOW()
            GROUP BY DATE_FORMAT(a.appliedAt, '%Y-%m'), DATE_FORMAT(a.appliedAt, '%b %Y')
            ORDER BY DATE_FORMAT(a.appliedAt, '%Y-%m');
        `;

        const analytics = rawAnalytics.map(row => ({
            month: row.month,
            total: Number(row.total)
        }));

        const currentMonthIndex = moment().month();
        const currentYearStr = moment().format('YYYY');

        const finalAnalytics = allMonths.slice(0, currentMonthIndex + 1).map(m => {
            const monthStr = `${m} ${currentYearStr}`;
            const found = analytics.find(a => a.month === monthStr);
            return {
                month: monthStr,
                total: found ? found.total : 0
            };
        });

        const rawPostedJobs = await prisma.$queryRaw<any[]> `
        SELECT
        DATE_FORMAT(createdAt, '%b %Y') AS month,
        COUNT(*) AS total
        FROM Job
        WHERE createdBy = ${id}
        AND createdAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
        AND createdAt <= NOW()
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%b %Y')
        ORDER BY DATE_FORMAT(createdAt, '%Y-%m');
        `;

        const postedJobsAnalytics = rawPostedJobs.map(row => ({
            month: row.month,
            total: Number(row.total)
        }));

        const finalPostedJobsAnalytics = allMonths.slice(0, currentMonthIndex + 1).map(m => {
            const monthStr = `${m} ${currentYearStr}`;
            const found = postedJobsAnalytics.find(a => a.month === monthStr);
            return {
                month: monthStr,
                total: found ? found.total : 0
            };
        });

       

        return {
            applicationsReceivedPerMonth: finalAnalytics,
            jobsPostedPerMonth: finalPostedJobsAnalytics
        };
    } catch (error) {
        throw error;
    }
}

const getAnalyticsForAdmin = async (req : any) => {
    return {};
}

export default {getAnalyticsForCandidate, getAnalyticsForRecruiter, getAnalyticsForAdmin}
