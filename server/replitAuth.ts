import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { identityService } from "./services/identityService";
import type { AuthResult } from "./auth/adapters";

// Extend Express.User to match our AuthResult type
declare global {
  namespace Express {
    interface User extends AuthResult {
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: Express.User,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  const claims = tokens.claims();
  
  if (!claims) {
    throw new Error("No claims in token response");
  }
  
  // Store user in the format expected by authGuard
  user.userId = String(claims["sub"]);
  user.email = claims["email"] ? String(claims["email"]) : undefined;
  user.name = claims["first_name"] && claims["last_name"] 
    ? `${claims["first_name"]} ${claims["last_name"]}` 
    : claims["first_name"] ? String(claims["first_name"]) : String(claims["sub"]);
  user.profileImage = claims["profile_image_url"] ? String(claims["profile_image_url"]) : undefined;
  
  // Store auth tokens for refresh
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = claims?.exp as number | undefined;
}

async function upsertUser(userId: string, email: string | undefined, name: string, profileImage: string | undefined) {
  // Use the existing identity service to create or find user
  await identityService.findOrCreateUser(
    "replit",
    userId,
    email || `${userId}@replit.local`,
    name,
    profileImage
  );
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const claims = tokens.claims();
    
    if (!claims) {
      verified(new Error("No claims in token response"), false);
      return;
    }
    
    const user: Express.User = {
      userId: String(claims["sub"]),
    };
    
    updateUserSession(user, tokens);
    
    const userId = String(claims["sub"]);
    const email = claims["email"] ? String(claims["email"]) : undefined;
    const name = claims["first_name"] && claims["last_name"] 
      ? `${claims["first_name"]} ${claims["last_name"]}` 
      : claims["first_name"] ? String(claims["first_name"]) : String(claims["sub"]);
    const profileImage = claims["profile_image_url"] ? String(claims["profile_image_url"]) : undefined;
    
    await upsertUser(userId, email, name, profileImage);
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
