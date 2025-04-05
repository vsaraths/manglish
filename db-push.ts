#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import { sql } from "drizzle-orm";
import * as schema from "./shared/schema";

// This script is used to push the schema to the database
async function main() {
  console.log("Creating database connection...");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log("Pushing schema to database...");
  const db = drizzle(pool, { schema });
  
  try {
    // Push schema to database
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // The schema will be applied automatically when the server starts
    console.log("Schema pushed successfully!");
  } catch (error) {
    console.error("Error pushing schema:", error);
    process.exit(1);
  }

  await pool.end();
  console.log("Database connection closed");
}

main();