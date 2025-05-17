import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

// JWT secret should be in environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "glowbot-secret-key";
const JWT_EXPIRES_IN = "24h";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        email?: string;
        role: string;
      };
    }
  }
}

// Generate a JWT token
export const generateToken = (user: { id: number; username: string; email?: string; role: string }) => {
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Middleware to authenticate JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
        email?: string;
        role: string;
      };
      
      // Check if user exists in database
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ message: "Account is not active" });
      }
      
      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check role-based access
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};