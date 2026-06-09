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


export default {
    auth
}