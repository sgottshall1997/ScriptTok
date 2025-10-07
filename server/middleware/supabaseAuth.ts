import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️ Missing Supabase environment variables for backend auth');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email?: string;
  };
}

export async function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured - skipping auth');
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authorization header' 
    });
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }

    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!supabase) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  supabase.auth.getUser(token)
    .then(({ data: { user } }) => {
      if (user) {
        req.userId = user.id;
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
      next();
    })
    .catch(() => {
      next();
    });
}
