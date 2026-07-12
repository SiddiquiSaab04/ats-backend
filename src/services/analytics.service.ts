import { prisma } from "../prisma/client";
import moment from "moment";
import { AppError } from "../utils/AppError";

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

export interface AnalyticsItem {
  title: string;
  value: any;
}

const getAnalytics = async (userId: number, role: string): Promise<AnalyticsItem[]> => {
  try {
    if (role === "CANDIDATE") {
      const rawAnalytics = await prisma.$queryRaw<any[]>`
        SELECT
        DATE_FORMAT(appliedAt, '%b %Y') AS month,
        COUNT(*) AS total
        FROM Application
        WHERE candidateId = ${userId}
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
          candidateId: userId,
          status: "OFFERED"
        }
      });

      const totalApplicants = await prisma.application.count({
        where: {
          candidateId: userId
        }
      });

      const successRate = totalApplicants === 0 ? 0 : (offeredApplicants / totalApplicants) * 100;

      const recentActivity = await prisma.application.findMany({
        where: {
          candidateId: userId
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
        appliedAt: moment(activity.appliedAt).format('DD MMM YYYY'),
        status: activity.status
      }));

      return [
        { title: "Total Applications Per Month", value: finalAnalytics },
        { title: "Offered Applicants", value: offeredApplicants },
        { title: "Success Rate", value: successRate },
        { title: "Recent Activity", value: formattedRecentActivities }
      ];
    }

    if (role === "RECRUITER") {
      const rawAnalytics = await prisma.$queryRaw<any[]>`
        SELECT
        DATE_FORMAT(a.appliedAt, '%b %Y') AS month,
        COUNT(*) AS total
        FROM Application a
        JOIN Job j ON a.jobId = j.id
        WHERE j.createdBy = ${userId}
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

      const rawPostedJobs = await prisma.$queryRaw<any[]>`
        SELECT
        DATE_FORMAT(createdAt, '%b %Y') AS month,
        COUNT(*) AS total
        FROM Job
        WHERE createdBy = ${userId}
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
        where: { createdBy: userId },
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
          job: { createdBy: userId }
        }
      });

      const offeredApplicationsForRecruiter = await prisma.application.count({
        where: {
          job: { createdBy: userId },
          status: "OFFERED"
        }
      });

      const hiringRate = totalApplicationsForRecruiter === 0 ? 0 : (offeredApplicationsForRecruiter / totalApplicationsForRecruiter) * 100;

      return [
        { title: "Applications Received Per Month", value: finalAnalytics },
        { title: "Jobs Posted Per Month", value: finalPostedJobsAnalytics },
        { title: "Most Popular Job", value: mostPopularJob },
        { title: "Hiring Rate", value: hiringRate }
      ];
    }

    if (role === "ADMIN") {
      const currentMonthIndex = moment().month();
      const currentYearStr = moment().format('YYYY');

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

      return [
        { title: "Platform Growth", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newUsers })) },
        { title: "New Users Per Month", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newUsers })) },
        { title: "New Recruiters Per Month", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newRecruiters })) },
        { title: "New Candidates Per Month", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.newCandidates })) },
        { title: "Jobs Posted Per Month", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.jobsPosted })) },
        { title: "Applications Per Month", value: finalPlatformGrowth.map(m => ({ month: m.month, total: m.applications })) },
        { title: "Top Companies By Hiring", value: topCompaniesByHiring }
      ];
    }

    throw new AppError("Invalid role", 400);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to fetch analytics for ${role.toLowerCase()}`, 500);
  }
};

export default {
  getAnalytics
};

