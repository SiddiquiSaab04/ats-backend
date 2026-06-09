import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];    

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY!);
        (req as any).user = decoded;
        next();
    } catch(error: any) {
        return res.status(401).json({ 
            success: false, 
            message: `Auth Failed: ${error.message}` 
        });
    }
}

const authorizeRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        next();
    }
}

export default {
    auth,
    authorizeRole,
}