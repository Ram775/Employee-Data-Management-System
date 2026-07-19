require("dotenv").config();

const { Pool } = require("pg");

let pool;

async function connectDB() {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test Connection
    await pool.query("SELECT NOW()");

    console.log("✅ Supabase Connected Successfully");

    return pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
}

module.exports = connectDB;
