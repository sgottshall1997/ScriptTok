// controllers/auth.controller.ts
import { db } from "../../database/index.js";
import { authusers } from "@server/schema/schema.js"; 
import { IUserSignup, IUserSignin, IAuthTokens, IForgotPassword, IResetPassword, IVerifyEmail, ISendOTP, IVerifyOTP } from "@server/interfaces/auth/auth.interface.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { generateToken, generateOTP, sendPasswordResetEmail, sendVerificationEmail, sendOTPEmail } from "@server/services/email-service/email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// Generate tokens
const generateTokens = (userId: number): IAuthTokens => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  console.log("🔵 [SIGNUP] Request received");
  console.log("🔵 [SIGNUP] Request body:", { ...req.body, password: "[HIDDEN]" });
  
  try {
    const { fullName, phoneNumber, email, password }: IUserSignup = req.body;
    console.log("🔵 [SIGNUP] Processing signup for:", { fullName, phoneNumber, email });
    console.log("🔵 [SIGNUP] Checking for existing email...");
    const existingUser = await db.select().from(authusers).where(eq(authusers.email, email));
    if (existingUser.length > 0) {
      console.log("❌ [SIGNUP] Email already exists:", email);
      res.status(400).json({ message: "Email already exists" });
      return;
    }
    
    console.log("🔵 [SIGNUP] Checking for existing phone number...");
    const existingnmbr = await db.select().from(authusers).where(eq(authusers.phoneNumber, phoneNumber));
    if (existingnmbr.length > 0) {
      console.log("❌ [SIGNUP] Phone number already exists:", phoneNumber);
      res.status(400).json({ message: "Number already exists" });
      return;
    }
    console.log("🔵 [SIGNUP] Creating user account...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log("🔵 [SIGNUP] Inserting user into database...");
    const [newUser] = await db.insert(authusers).values({
      fullName,
      phoneNumber,
      email,
      passwordHash: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
    }).returning();
    
    console.log("✅ [SIGNUP] User created with ID:", newUser.id);
    
    console.log("🔵 [SIGNUP] Generating JWT tokens...");
    const tokens = generateTokens(newUser.id);
    await db.update(authusers).set({ refreshToken: tokens.refreshToken }).where(eq(authusers.id, newUser.id));
    
    console.log("🔵 [SIGNUP] Sending verification email...");
    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken, fullName);
      console.log("✅ [SIGNUP] Verification email sent successfully");
    } catch (emailError) {
      console.error("❌ [SIGNUP] Failed to send verification email:", emailError);
      // Don't fail the signup if email fails
    }
    
    console.log("✅ [SIGNUP] Signup completed successfully for:", email);
    res.status(201).json({
      message: "Signup successful",
      user: { id: newUser.id, fullName, email },
      tokens,
    });
  } catch (error) {
    console.error("❌ [SIGNUP] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Signin
export const signin = async (req: Request, res: Response): Promise<void> => {
  console.log("🟢 [SIGNIN] Request received");
  console.log("🟢 [SIGNIN] Request body:", { ...req.body, password: "[HIDDEN]" });
  
  try {
    const { email, password }: IUserSignin = req.body;
    console.log("🟢 [SIGNIN] Attempting login for:", email);
    
    console.log("🟢 [SIGNIN] Searching for user in database...");
    const [user] = await db.select().from(authusers).where(eq(authusers.email, email));
    if (!user) {
      console.log("❌ [SIGNIN] User not found for email:", email);
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    console.log("✅ [SIGNIN] User found:", { id: user.id, fullName: user.fullName, email: user.email });
    
    console.log("🟢 [SIGNIN] Verifying password...");
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log("❌ [SIGNIN] Invalid password for user:", email);
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    
    console.log("✅ [SIGNIN] Password verified successfully");
    
    console.log("🟢 [SIGNIN] Generating JWT tokens...");
    const tokens = generateTokens(user.id);
    await db.update(authusers).set({ refreshToken: tokens.refreshToken }).where(eq(authusers.id, user.id));
    
    console.log("✅ [SIGNIN] Login successful for:", email);
    
    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    // Only send access token in response (refresh token is in cookie)
    res.json({ 
      message: "Signin successful", 
      user: { id: user.id, fullName: user.fullName, email: user.email },
      accessToken: tokens.accessToken 
    });
  } catch (error) {
    console.error("❌ [SIGNIN] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Refresh Token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  console.log("🔄 [REFRESH] Request received");
  console.log("🔄 [REFRESH] Request cookies:", req.cookies);
  
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.log("❌ [REFRESH] No refresh token in cookie");
      res.status(401).json({ message: "Refresh token required" });
      return;
    }
    
    console.log("🔄 [REFRESH] Verifying refresh token...");
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };
    console.log("✅ [REFRESH] Token decoded for user ID:", decoded.userId);
    
    console.log("🔄 [REFRESH] Searching for user in database...");
    const [user] = await db.select().from(authusers).where(eq(authusers.id, decoded.userId));
    if (!user || user.refreshToken !== refreshToken) {
      console.log("❌ [REFRESH] Invalid or expired refresh token");
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }
    
    console.log("✅ [REFRESH] User found:", { id: user.id, fullName: user.fullName, email: user.email });
    
    console.log("🔄 [REFRESH] Generating new tokens...");
    const tokens = generateTokens(user.id);
    await db.update(authusers).set({ refreshToken: tokens.refreshToken }).where(eq(authusers.id, user.id));
    
    console.log("✅ [REFRESH] Token refresh successful for user:", user.email);
    
    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    // Only send access token in response
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error("❌ [REFRESH] Unexpected error:", error);
    res.status(401).json({
      message: error instanceof Error ? error.message : "Unauthorized",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  console.log("🔑 [FORGOT PASSWORD] Request received");
  console.log("🔑 [FORGOT PASSWORD] Request body:", req.body);
  
  try {
    const { email }: IForgotPassword = req.body;
    console.log("🔑 [FORGOT PASSWORD] Processing request for:", email);
    
    if (!email) {
      console.log("❌ [FORGOT PASSWORD] No email provided");
      res.status(400).json({ message: "Email is required" });
      return;
    }

    console.log("🔑 [FORGOT PASSWORD] Searching for user in database...");
    const [user] = await db.select().from(authusers).where(eq(authusers.email, email));
    
    if (!user) {
      console.log("❌ [FORGOT PASSWORD] User not found for email:", email);
      // Don't reveal if email exists or not for security
      res.json({ message: "If the email exists, a password reset link has been sent" });
      return;
    }

    console.log("✅ [FORGOT PASSWORD] User found:", { id: user.id, fullName: user.fullName, email: user.email });

    console.log("🔑 [FORGOT PASSWORD] Generating OTP...");
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log("🔑 [FORGOT PASSWORD] Generated OTP:", otp);
    console.log("🔑 [FORGOT PASSWORD] OTP expires at:", otpExpires);

    console.log("🔑 [FORGOT PASSWORD] Updating database with OTP...");
    await db.update(authusers)
      .set({ 
        otpCode: otp,
        otpExpires: otpExpires
      })
      .where(eq(authusers.id, user.id));

    console.log("🔑 [FORGOT PASSWORD] Sending OTP email...");
    try {
      await sendOTPEmail(email, otp, user.fullName);
      console.log("✅ [FORGOT PASSWORD] OTP email sent successfully");
      res.json({ message: "If the email exists, a verification code has been sent" });
    } catch (emailError) {
      console.error("❌ [FORGOT PASSWORD] Failed to send OTP email:", emailError);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  } catch (error) {
    console.error("❌ [FORGOT PASSWORD] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Reset Password (using OTP)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  console.log("🔒 [RESET PASSWORD] Request received");
  console.log("🔒 [RESET PASSWORD] Request body:", { ...req.body, password: "[HIDDEN]", email: req.body.email, otp: req.body.otp ? "[HIDDEN]" : "undefined" });
  
  try {
    const { email, otp, password }: { email: string; otp: string; password: string } = req.body;
    console.log("🔒 [RESET PASSWORD] Processing password reset with OTP...");
    
    if (!email || !otp || !password) {
      console.log("❌ [RESET PASSWORD] Missing email, OTP, or password");
      res.status(400).json({ message: "Email, OTP, and password are required" });
      return;
    }

    if (password.length < 8) {
      console.log("❌ [RESET PASSWORD] Password too short");
      res.status(400).json({ message: "Password must be at least 8 characters long" });
      return;
    }

    console.log("🔒 [RESET PASSWORD] Searching for user with email and OTP...");
    const [user] = await db.select().from(authusers)
      .where(eq(authusers.email, email));

    if (!user) {
      console.log("❌ [RESET PASSWORD] User not found for email:", email);
      res.status(400).json({ message: "Invalid or expired verification code" });
      return;
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      console.log("❌ [RESET PASSWORD] Invalid or expired OTP");
      res.status(400).json({ message: "Invalid or expired verification code" });
      return;
    }

    if (user.otpCode !== otp) {
      console.log("❌ [RESET PASSWORD] OTP mismatch. Expected:", user.otpCode, "Received:", otp);
      res.status(400).json({ message: "Invalid verification code" });
      return;
    }

    console.log("✅ [RESET PASSWORD] User found and OTP verified:", { id: user.id, fullName: user.fullName, email: user.email });

    console.log("🔒 [RESET PASSWORD] Hashing new password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔒 [RESET PASSWORD] Updating user password and clearing OTP...");
    await db.update(authusers)
      .set({ 
        passwordHash: hashedPassword,
        otpCode: null,
        otpExpires: null
      })
      .where(eq(authusers.id, user.id));

    console.log("✅ [RESET PASSWORD] Password reset successful for user:", user.email);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ [RESET PASSWORD] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  console.log("📧 [VERIFY EMAIL] Request received");
  console.log("📧 [VERIFY EMAIL] Request body:", { ...req.body, token: req.body.token ? "[HIDDEN]" : "undefined" });
  
  try {
    const { token }: IVerifyEmail = req.body;
    console.log("📧 [VERIFY EMAIL] Processing email verification...");
    
    if (!token) {
      console.log("❌ [VERIFY EMAIL] No verification token provided");
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    console.log("📧 [VERIFY EMAIL] Searching for user with verification token...");
    const [user] = await db.select().from(authusers)
      .where(eq(authusers.emailVerificationToken, token));

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      console.log("❌ [VERIFY EMAIL] Invalid or expired verification token");
      res.status(400).json({ message: "Invalid or expired verification token" });
      return;
    }

    console.log("✅ [VERIFY EMAIL] User found:", { id: user.id, fullName: user.fullName, email: user.email });

    console.log("📧 [VERIFY EMAIL] Updating email verification status...");
    await db.update(authusers)
      .set({ 
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      })
      .where(eq(authusers.id, user.id));

    console.log("✅ [VERIFY EMAIL] Email verification successful for user:", user.email);
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ [VERIFY EMAIL] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Send OTP for two-step verification
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  console.log("🔵 [SEND OTP] Request received");
  console.log("🔵 [SEND OTP] Request body:", req.body);
  
  try {
    const { email }: ISendOTP = req.body;
    console.log("🔵 [SEND OTP] Email extracted:", email);
    
    if (!email) {
      console.log("❌ [SEND OTP] Email is missing");
      res.status(400).json({ message: "Email is required" });
      return;
    }

    console.log("🔵 [SEND OTP] Searching for user in database...");
    const [user] = await db.select().from(authusers).where(eq(authusers.email, email));
    
    if (!user) {
      console.log("❌ [SEND OTP] User not found for email:", email);
      // Don't reveal if email exists or not for security
      res.json({ message: "If the email exists, a verification code has been sent" });
      return;
    }

    console.log("✅ [SEND OTP] User found:", {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    console.log("🔵 [SEND OTP] Generated OTP:", otp);
    console.log("🔵 [SEND OTP] OTP expires at:", otpExpires);

    console.log("🔵 [SEND OTP] Updating database with OTP...");
    await db.update(authusers)
      .set({ 
        otpCode: otp,
        otpExpires: otpExpires
      })
      .where(eq(authusers.id, user.id));
    
    console.log("✅ [SEND OTP] Database updated successfully");

    try {
      console.log("🔵 [SEND OTP] Attempting to send email...");
      await sendOTPEmail(email, otp, user.fullName);
      console.log("✅ [SEND OTP] Email sent successfully!");
      res.json({ message: "If the email exists, a verification code has been sent" });
    } catch (emailError) {
      console.error("❌ [SEND OTP] Email sending failed:", emailError);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  } catch (error) {
    console.error("❌ [SEND OTP] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Verify OTP for two-step verification
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  console.log("🟢 [VERIFY OTP] Request received");
  console.log("🟢 [VERIFY OTP] Request body:", req.body);
  
  try {
    const { email, otp }: IVerifyOTP = req.body;
    console.log("🟢 [VERIFY OTP] Email:", email);
    console.log("🟢 [VERIFY OTP] OTP received:", otp);
    
    if (!email || !otp) {
      console.log("❌ [VERIFY OTP] Missing email or OTP");
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    console.log("🟢 [VERIFY OTP] Searching for user in database...");
    const [user] = await db.select().from(authusers)
      .where(eq(authusers.email, email));

    if (!user) {
      console.log("❌ [VERIFY OTP] User not found for email:", email);
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    console.log("✅ [VERIFY OTP] User found:", {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      otpCode: user.otpCode,
      otpExpires: user.otpExpires
    });

    if (!user.otpCode || !user.otpExpires) {
      console.log("❌ [VERIFY OTP] No OTP found in database");
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    if (user.otpExpires < new Date()) {
      console.log("❌ [VERIFY OTP] OTP has expired. Expires:", user.otpExpires, "Current time:", new Date());
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    if (user.otpCode !== otp) {
      console.log("❌ [VERIFY OTP] OTP mismatch. Expected:", user.otpCode, "Received:", otp);
      res.status(400).json({ message: "Invalid OTP code" });
      return;
    }

    console.log("✅ [VERIFY OTP] OTP verification successful!");

    // Don't clear the OTP here - it will be cleared during password reset
    console.log("🟢 [VERIFY OTP] OTP verified successfully, keeping it for password reset");

    res.json({ 
      message: "OTP verified successfully",
      user: { id: user.id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    console.error("❌ [VERIFY OTP] Unexpected error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};

// Test email configuration
export const testEmail = async (req: Request, res: Response): Promise<void> => {
  console.log("🧪 [TEST EMAIL] Request received");
  console.log("🧪 [TEST EMAIL] Request body:", req.body);
  
  try {
    const { email } = req.body;
    console.log("🧪 [TEST EMAIL] Email extracted:", email);
    
    if (!email) {
      console.log("❌ [TEST EMAIL] Email is missing");
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Debug: Show current email configuration
    console.log("🔍 [EMAIL DEBUG] Current configuration:");
    console.log("📧 [EMAIL DEBUG] EMAIL_USER:", process.env.EMAIL_USER);
    console.log("📧 [EMAIL DEBUG] EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
    console.log("📧 [EMAIL DEBUG] From email will be:", process.env.EMAIL_USER);

    // Test with a simple OTP
    const testOTP = "123456";
    console.log("🧪 [TEST EMAIL] Using test OTP:", testOTP);
    console.log("🧪 [TEST EMAIL] Attempting to send test email...");
    
    await sendOTPEmail(email, testOTP, "Test User");
    
    console.log("✅ [TEST EMAIL] Test email sent successfully!");
    res.json({ 
      message: "Test email sent successfully",
      from: process.env.EMAIL_USER,
      emailService: process.env.EMAIL_SERVICE,
      otp: testOTP // Only for testing - remove in production
    });
  } catch (error) {
    console.error("❌ [TEST EMAIL] Email test error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Email test failed",
      stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
    });
  }
};
