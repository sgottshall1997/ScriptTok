// routes/auth.route.ts
import express from "express";
import { signup, signin, refresh, forgotPassword, resetPassword, verifyEmail, sendOTP, verifyOTP, testEmail } from "@server/controllers/auth/auth.controller"; 

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/signin", signin);
authRoutes.post("/refresh-token", refresh);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/send-otp", sendOTP);
authRoutes.post("/verify-otp", verifyOTP);
authRoutes.post("/test-email", testEmail);

export default authRoutes;
