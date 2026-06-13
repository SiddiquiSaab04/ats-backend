import { Request } from "express";

interface PaginationParams {
    page: number;
    limit: number;
    search?:string;
}

interface PaginatedResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        limit: number;
        totalRecords: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Generic paginate function that works with any Prisma model.
 *
 * @param model   - The Prisma model delegate (e.g. prisma.job, prisma.user)
 * @param params  - { page, limit }
 * @param options - Prisma findMany options (where, include, orderBy, select, etc.)
 *                  Do NOT pass skip/take — they are computed automatically.
 * @param search  - Search params
 * @returns       - { data, pagination }
 *
 * @example
 *   const result = await paginate(prisma.job, { page: 1, limit: 10 }, {
 *       orderBy: { createdAt: 'desc' },
 *       include: { company: true },
 *   });
 */
const paginate = async <T>(
    model: any,
    { page, limit }: PaginationParams,
    options: Record<string, any> = {}
): Promise<PaginatedResult<T>> => {
    const skip = (page - 1) * limit;

    const { where, ...rest } = options;

    const [data, totalRecords] = await Promise.all([
        model.findMany({
            ...rest,
            where,
            skip,
            take: limit,
        }),
        model.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
        data,
        pagination: {
            currentPage: page,
            limit,
            totalRecords,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};

const parsePaginationQuery = (req: Request, maxLimit: number = 100): PaginationParams => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = req.query.search as string;
    return { page, limit ,search };
};

export { paginate, parsePaginationQuery, PaginatedResult, PaginationParams };
