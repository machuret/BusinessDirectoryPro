import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the correct database with your business data
const DATABASE_URL = "postgresql://repplit_owner:npg_qtLveA26UxGP@ep-proud-mountain-a85015ts-pooler.eastus2.azure.neon.tech/repplit?sslmode=require";

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('Database URL being used:', DATABASE_URL.replace(/:[^@]*@/, ':***@')); // Log without password

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });