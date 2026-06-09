import { Request, Response } from "express";
import userService from "../services/user.service";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json({ success: true, message: "Users fetched successfully", users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ success: false, message: "Error fetching users" });
    }
}

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const email = (req as any).user?.email as string;
        const user = await userService.getCurrentUser(email);
        return res.status(200).json({ success: true, message: "User fetched successfully", user });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ success: false, message: "Error fetching user" });
    }
}

export default {
    getAllUsers,
    getCurrentUser,
}