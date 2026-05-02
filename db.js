
const sql = require("mssql");

const server = process.env.APPSETTING_DB_HOST || process.env.DB_HOST;
const isAzureSql = server && server.includes("database.windows.net");
// تحديد بيئة التشغيل
const isAzure = !!process.env.APPSETTING_DB_HOST;

// إعدادات قاعدة البيانات
const config = {
  server: isAzure ? process.env.APPSETTING_DB_HOST : process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  //options: {
  //  encrypt: isAzureSql, // Azure => true, Local => false
  //  trustServerCertificate: !isAzureSql // Local => true
  //}

  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === "true"
  }

};


if (!config.server || !config.user || !config.password || !config.database) {
  throw new Error("Database configuration is incomplete");
}

const pool = new sql.ConnectionPool(config);

const poolConnect = pool.connect()
  .then(() => {
    console.log("✅ Connected to SQL Server");
  })
  .catch(err => {
    console.error("❌ DB Connection Failed:", err);
  });

module.exports = {
  sql,
  pool,
  poolConnect,
  config
};