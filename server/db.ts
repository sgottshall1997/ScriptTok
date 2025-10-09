import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon in production
if (process.env.NODE_ENV === 'production') {
  neonConfig.webSocketConstructor = ws;
} else {
  try {
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    console.warn('WebSocket configuration failed, falling back to HTTP');
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Convert direct Neon connection to pooled connection if needed
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL!; // Safe because we check above
  
  // If it's a Neon direct connection (not already pooled), convert to pooled
  if (url.includes('.neon.tech') && !url.includes('-pooler')) {
    const pooledUrl = url.replace(/(@[\w-]+)\./, '$1-pooler.');
    console.log('[DB] 🔄 Using Neon pooled connection (handles auto-suspend)');
    return pooledUrl;
  }
  
  return url;
};

export const pool = new Pool({ 
  connectionString: getDatabaseUrl(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });
