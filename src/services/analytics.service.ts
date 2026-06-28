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

        const mostPopularJobRaw = await prisma.job.findFirst({
            where: { createdBy: id },
            orderBy: {
                applications: {
                    _count: 'desc'
                }
            },
            select: {
                title: true,
                _count: {
                    select: { applications: true }
                }
            }
        });

        const mostPopularJob = mostPopularJobRaw ? {
            title: mostPopularJobRaw.title,
            applications: mostPopularJobRaw._count.applications
        } : null;

        const totalApplicationsForRecruiter = await prisma.application.count({
            where: {
                job: { createdBy: id }
            }
        });

        const offeredApplicationsForRecruiter = await prisma.application.count({
            where: {
                job: { createdBy: id },
                status: "OFFERED"
            }
        });

        const hiringRate = totalApplicationsForRecruiter === 0 ? 0 : (offeredApplicationsForRecruiter / totalApplicationsForRecruiter) * 100;

        return {
            applicationsReceivedPerMonth: finalAnalytics,
            jobsPostedPerMonth: finalPostedJobsAnalytics,
            mostPopularJob,
            hiringRate
        };
    } catch (error) {
        throw error;
    }
}

const getAnalyticsForAdmin = async (req: any) => {
    try {
        const currentMonthIndex = moment().month();
        const currentYearStr = moment().format('YYYY');

        // Users Growth (New Users, Recruiters, Candidates)
        const rawUsersGrowth = await prisma.$queryRaw<any[]>`
            SELECT
            DATE_FORMAT(createdAt, '%b %Y') AS month,
            COUNT(*) AS totalUsers,
            SUM(CASE WHEN role = 'CANDIDATE' THEN 1 ELSE 0 END) AS totalCandidates,
            SUM(CASE WHEN role = 'RECRUITER' THEN 1 ELSE 0 END) AS totalRecruiters
            FROM User
            WHERE createdAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
            AND createdAt <= NOW()
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%b %Y')
            ORDER BY DATE_FORMAT(createdAt, '%Y-%m');
        `;

        const usersGrowthAnalytics = rawUsersGrowth.map(row => ({
            month: row.month,
            totalUsers: Number(row.totalUsers),
            totalCandidates: Number(row.totalCandidates),
            totalRecruiters: Number(row.totalRecruiters)
        }));

        // Jobs Posted Per Month
        const rawJobsPosted = await prisma.$queryRaw<any[]>`
            SELECT
            DATE_FORMAT(createdAt, '%b %Y') AS month,
            COUNT(*) AS totalJobs
            FROM Job
            WHERE createdAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
            AND createdAt <= NOW()
            GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%b %Y')
            ORDER BY DATE_FORMAT(createdAt, '%Y-%m');
        `;

        const jobsPostedAnalytics = rawJobsPosted.map(row => ({
            month: row.month,
            totalJobs: Number(row.totalJobs)
        }));

        // Applications Per Month
        const rawApplications = await prisma.$queryRaw<any[]>`
            SELECT
            DATE_FORMAT(appliedAt, '%b %Y') AS month,
            COUNT(*) AS totalApplications
            FROM Application
            WHERE appliedAt >= DATE_FORMAT(NOW(), '%Y-01-01 00:00:00')
            AND appliedAt <= NOW()
            GROUP BY DATE_FORMAT(appliedAt, '%Y-%m'), DATE_FORMAT(appliedAt, '%b %Y')
            ORDER BY DATE_FORMAT(appliedAt, '%Y-%m');
        `;

        const applicationsAnalytics = rawApplications.map(row => ({
            month: row.month,
            totalApplications: Number(row.totalApplications)
        }));

        // Fill missing months for all metrics
        const finalPlatformGrowth = allMonths.slice(0, currentMonthIndex + 1).map(m => {
            const monthStr = `${m} ${currentYearStr}`;
            const users = usersGrowthAnalytics.find(a => a.month === monthStr);
            const jobs = jobsPostedAnalytics.find(a => a.month === monthStr);
            const apps = applicationsAnalytics.find(a => a.month === monthStr);
            
            return {
                month: monthStr,
                newUsers: users ? users.totalUsers : 0,
                newCandidates: users ? users.totalCandidates : 0,
                newRecruiters: users ? users.totalRecruiters : 0,
                jobsPosted: jobs ? jobs.totalJobs : 0,
                applications: apps ? apps.totalApplications : 0
            };
        });

        // Top Companies by Hiring
        const rawTopCompanies = await prisma.$queryRaw<any[]>`
            SELECT
            c.name as name,
            COUNT(a.id) as hires
            FROM Application a
            JOIN Job j ON a.jobId = j.id
            JOIN Company c ON j.companyId = c.id
            WHERE a.status = 'OFFERED'
            GROUP BY c.id
            ORDER BY hires DESC
            LIMIT 10;
        `;

        const topCompaniesByHiring = rawTopCompanies.map(row => ({
            name: row.name,
            hires: Number(row.hires)
        }));

        return {
            platformGrowth: finalPlatformGrowth.map(m => ({ month: m.month, users: m.newUsers })),
            newUsersPerMonth: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newUsers })),
            newRecruitersPerMonth: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newRecruiters })),
            newCandidatesPerMonth: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newCandidates })),
            jobsPostedPerMonth: finalPlatformGrowth.map(m => ({ month: m.month, total: m.jobsPosted })),
            applicationsPerMonth: finalPlatformGrowth.map(m => ({ month: m.month, total: m.applications })),
            topCompaniesByHiring
        };
    } catch (error) {
        throw error;
    }
}

export default {getAnalyticsForCandidate, getAnalyticsForRecruiter, getAnalyticsForAdmin}
