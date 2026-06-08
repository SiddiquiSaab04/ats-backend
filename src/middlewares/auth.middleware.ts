import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("--- DEBUG START ---");
        console.log("Token Extracted:", token);
        
        if (!token) {
            console.log("Result: Token nahi mila, block running");
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        console.log("Secret Key Checked:", process.env.JWT_SECRETKEY ? "Key Maujood Hai" : "Key MISSING Hai!");

        // Token verify karne ki koshish
        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY!);
        console.log("Token Decoded Successfully:", decoded);

        (req as any).user = decoded;
        next();
    } catch(error: any) {
        console.log("--- CATCH BLOCK TRIGGERED ---");
        console.log("Exact Error Message:", error.message); // Yeh batayega ke masla kya hai
        
        // Response mein asli wajah bhein taake Postman mein saaf dikhe
        return res.status(401).json({ 
            success: false, 
            message: `Auth Failed: ${error.message}` 
        });
    }
}


export default {
    auth
}