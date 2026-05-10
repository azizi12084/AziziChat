const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  keepAlive: true
});

module.exports = {
  pool
};