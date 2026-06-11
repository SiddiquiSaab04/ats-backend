"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = exports.paginate = void 0;
/**
 * Generic paginate function that works with any Prisma model.
 *
 * @param model   - The Prisma model delegate (e.g. prisma.job, prisma.user)
 * @param params  - { page, limit }
 * @param options - Prisma findMany options (where, include, orderBy, select, etc.)
 *                  Do NOT pass skip/take — they are computed automatically.
 * @returns       - { data, pagination }
 *
 * @example
 *   const result = await paginate(prisma.job, { page: 1, limit: 10 }, {
 *       orderBy: { createdAt: 'desc' },
 *       include: { company: true },
 *   });
 */
const paginate = async (model, { page, limit }, options = {}) => {
    const skip = (page - 1) * limit;
    // Extract 'where' from options so count() uses the same filter
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
exports.paginate = paginate;
/**
 * Parse and validate pagination query params from an Express request.
 * Defaults: page = 1, limit = 10. Limit is capped at maxLimit (default 100).
 */
const parsePaginationQuery = (req, maxLimit = 100) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || 10));
    return { page, limit };
};
exports.parsePaginationQuery = parsePaginationQuery;
