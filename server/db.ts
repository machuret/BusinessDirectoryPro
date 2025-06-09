import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use your specific Neon database
const DATABASE_URL = "postgresql://repplit_owner:npg_qtLveA26UxGP@ep-proud-mountain-a85015ts-pooler.eastus2.azure.neon.tech/repplit?sslmode=require";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });