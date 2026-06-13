import { Request , Response , NextFunction } from "express";
import authService from "../services/auth.service";

const signup = async(req:Request , res:Response , next:NextFunction)=>{
  try{
    const {name , email , password , role} = req.body;
    if(!name || !email || !password || !role){
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const signupUser = await authService.signup(req);
    if(!signupUser){
      return res.status(400).json({ success: false, message: "Error signing up" });
    }
    return res.status(200).json({ success: true, message: "User signed up successfully", user: signupUser });
  }catch(error){
    console.log("Error signing up:", error);
    next(error);
  }
}


const login = async(req:Request , res:Response , next:NextFunction)=>{
  try{
    const {email , password} = req.body;

    if(!email || !password){
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const loginUser = await authService.login(req);

    if(!loginUser){
      return res.status(400).json({ success: false, message: "Error logging in" });
    }
    return res.status(200).json({ success: true, message: "User logged in successfully", user: loginUser });

  }catch(error){
     next(error);
  }
}


export default {
  signup,
  login
}