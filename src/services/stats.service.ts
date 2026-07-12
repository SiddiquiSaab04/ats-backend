import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export interface StatItem {
  title: string;
  value: number;
}

const getStats = async (userId: number, role: string): Promise<StatItem[]> => {
  try {
    if (role === "CANDIDATE") {
      const stats = await prisma.application.groupBy({
        by: ["status"],
        where: {
          candidateId: userId
        },
        _count: {
          status: true
        }
      });

      const totalApplications = await prisma.application.count({
        where: {
          candidateId: userId
        }
      });

      const formattedStats: Record<string, number> = {
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
        const statusKey = stat.status as keyof typeof formattedStats;
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
      const totalJobs = await prisma.job.count({
        where: {
          createdBy: userId
        }
      });

      const jobsStats = await prisma.job.groupBy({
        by: ["status"],
        where: {
          createdBy: userId
        },
        _count: {
          status: true
        }
      });

      const totalApplications = await prisma.application.groupBy({
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
        const statusKey = stat.status as keyof typeof jobStatusStats;
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
        const statusKey = stat.status as keyof typeof appStatusStats;
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
      const totalJobs = await prisma.job.count();
      const totalApplications = await prisma.application.count();
      const totalHired = await prisma.application.count({
        where: {
          status: "OFFERED"
        }
      });
      const totalCompanies = await prisma.company.count();
      const totalUsers = await prisma.user.groupBy({
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
        const roleKey = stat.role as keyof typeof userRoleStats;
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

    throw new AppError("Invalid role", 400);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to fetch stats for ${role.toLowerCase()}`, 500);
  }
};

export default {
  getStats
};