// server/src/services/email-service/email.service.ts
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration - Try Gmail first, then Outlook
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail' or 'hotmail'
  host: process.env.EMAIL_SERVICE === 'hotmail' ? 'smtp-mail.outlook.com' : 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate random token
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email: string, token: string, fullName: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - BuildAIde',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to BuildAIde!</h2>
        <p>Hi ${fullName},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The BuildAIde Team</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string, fullName: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - BuildAIde',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${fullName},</p>
        <p>You requested a password reset for your BuildAIde account. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The BuildAIde Team</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Send OTP email for two-step verification
export const sendOTPEmail = async (email: string, otp: string, fullName: string) => {
  console.log("📧 [EMAIL SERVICE] Starting OTP email process");
  console.log("📧 [EMAIL SERVICE] Email:", email);
  console.log("📧 [EMAIL SERVICE] OTP:", otp);
  console.log("📧 [EMAIL SERVICE] Full Name:", fullName);
  console.log("📧 [EMAIL SERVICE] From Email:", process.env.EMAIL_USER);
  console.log("📧 [EMAIL SERVICE] Email Service:", process.env.EMAIL_SERVICE || 'gmail');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code - BuildAIde',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Two-Step Verification</h2>
        <p>Hi ${fullName},</p>
        <p>You requested a password reset. Please use the following verification code:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The BuildAIde Team</p>
      </div>
    `,
  };

  console.log("📧 [EMAIL SERVICE] Mail options prepared:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  });

  try {
    console.log("📧 [EMAIL SERVICE] Attempting to send email via transporter...");
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL SERVICE] Email sent successfully!");
    console.log("📧 [EMAIL SERVICE] Message ID:", result.messageId);
    console.log("📧 [EMAIL SERVICE] Response:", result.response);
    return result;
  } catch (error) {
    console.error("❌ [EMAIL SERVICE] Email sending failed!");
    console.error("📧 [EMAIL SERVICE] Error details:", error);
    if (error instanceof Error) {
      console.error("📧 [EMAIL SERVICE] Error message:", error.message);
      console.error("📧 [EMAIL SERVICE] Error code:", (error as any).code);
      console.error("📧 [EMAIL SERVICE] Error response:", (error as any).response);
    }
    throw error;
  }
};
