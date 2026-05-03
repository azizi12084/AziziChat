if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const fs = require("fs");
const { pool } = require("./db_pg");

async function runSchema() {
  if (process.env.ALLOW_SCHEMA_RESET !== "true") {
    console.error("❌ Schema reset blocked.");
    console.error("Set ALLOW_SCHEMA_RESET=true only when you intentionally want to recreate all tables.");
    process.exit(1);
  }

  try {
    console.log("⚠️ Dropping old tables...");

    await pool.query(`
      DROP TABLE IF EXISTS Messages CASCADE;
      DROP TABLE IF EXISTS Contacts CASCADE;
      DROP TABLE IF EXISTS Rooms CASCADE;
      DROP TABLE IF EXISTS Users CASCADE;
    `);

    console.log("Creating new tables...");

    const schema = fs.readFileSync("./schema_pg.sql", "utf8");
    await pool.query(schema);

    console.log("✅ PostgreSQL schema recreated successfully");
  } catch (err) {
    console.error("❌ Failed to recreate schema:", err);
  } finally {
    await pool.end();
  }
}

runSchema();