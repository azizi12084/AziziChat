const sql = require("mssql");

const server = process.env.APPSETTING_DB_HOST || process.env.DB_HOST;

const isAzureSql = server && server.includes("database.windows.net");

const config = {
  server,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  options: {
    encrypt: isAzureSql,
    trustServerCertificate: !isAzureSql
  }
};

// 🔥 إنشاء pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// تسجيل الحالة (اختياري لكن مفيد)
poolConnect
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Connection Failed:", err));

module.exports = {
  sql,
  pool,
  poolConnect
};