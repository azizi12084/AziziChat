const { Pool } = require("pg");

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = {
  Int: "int",
  NVarChar: () => "nvarchar",
  MAX: "max"
};

function normalizeRow(row) {
  const mapped = {};

  for (const key in row) {
    const lower = key.toLowerCase();

    if (lower === "id") mapped.Id = row[key];
    else if (lower === "username") mapped.Username = row[key];
    else if (lower === "email") mapped.Email = row[key];
    else if (lower === "passwordhash") mapped.PasswordHash = row[key];
    else if (lower === "isemailverified") mapped.IsEmailVerified = row[key];
    else if (lower === "createdat") mapped.CreatedAt = row[key];
    else if (lower === "lastlogin") mapped.LastLogin = row[key];
    else if (lower === "isactive") mapped.IsActive = row[key];

    else if (lower === "contactid") mapped.ContactId = row[key];
    else if (lower === "userid") mapped.UserId = row[key];
    else if (lower === "contactuserid") mapped.ContactUserId = row[key];
    else if (lower === "status") mapped.Status = row[key];
    else if (lower === "updatedat") mapped.UpdatedAt = row[key];

    else if (lower === "roomid") mapped.RoomId = row[key];
    else if (lower === "name") mapped.Name = row[key];
    else if (lower === "isprivate") mapped.IsPrivate = row[key];
    else if (lower === "user1id") mapped.User1Id = row[key];
    else if (lower === "user2id") mapped.User2Id = row[key];
    else if (lower === "lastmessageat") mapped.LastMessageAt = row[key];

    else if (lower === "senderid") mapped.SenderId = row[key];
    else if (lower === "receiverid") mapped.ReceiverId = row[key];
    else if (lower === "messagetext") mapped.MessageText = row[key];
    else if (lower === "sentat") mapped.SentAt = row[key];

    else if (lower === "content") mapped.Content = row[key];
    else if (lower === "isread") mapped.IsRead = row[key];
    else if (lower === "isdeleted") mapped.IsDeleted = row[key];

    else mapped[key] = row[key];
  }

  return mapped;
}

function convertSqlServerToPostgres(query, params) {
  let text = query;

  text = text.replace(/SELECT\s+TOP\s+1/gi, "SELECT");
  text = text.replace(/SYSDATETIME\(\)/gi, "NOW()");
  text = text.replace(/GETDATE\(\)/gi, "NOW()");
  text = text.replace(/,\s*1\s*\)\s*RETURNING/gi, ", true) RETURNING");
  // Convert SQL Server bit comparisons to PostgreSQL boolean comparisons
text = text.replace(/\bIsPrivate\s*=\s*1\b/gi, "IsPrivate = true");
text = text.replace(/\bIsPrivate\s*=\s*0\b/gi, "IsPrivate = false");

text = text.replace(/\bIsRead\s*=\s*1\b/gi, "IsRead = true");
text = text.replace(/\bIsRead\s*=\s*0\b/gi, "IsRead = false");

text = text.replace(/\bIsDeleted\s*=\s*1\b/gi, "IsDeleted = true");
text = text.replace(/\bIsDeleted\s*=\s*0\b/gi, "IsDeleted = false");

text = text.replace(/\bIsEmailVerified\s*=\s*1\b/gi, "IsEmailVerified = true");
text = text.replace(/\bIsEmailVerified\s*=\s*0\b/gi, "IsEmailVerified = false");

text = text.replace(/\bIsActive\s*=\s*1\b/gi, "IsActive = true");
text = text.replace(/\bIsActive\s*=\s*0\b/gi, "IsActive = false");
  let returningClause = "";

    text = text.replace(/OUTPUT\s+Inserted\.Id,\s*Inserted\.Username,\s*Inserted\.Email,\s*Inserted\.IsEmailVerified/gi, () => {
    returningClause = " RETURNING Id, Username, Email, IsEmailVerified";
    return "";
    });

    text = text.replace(/OUTPUT\s+Inserted\.Id/gi, () => {
    returningClause = " RETURNING Id";
    return "";
    });

  const values = [];
  let index = 1;

  for (const name of Object.keys(params)) {
    const regex = new RegExp("@" + name + "\\b", "g");
    text = text.replace(regex, "$" + index);
    values.push(params[name]);
    index++;
  }

    if (
    /^\s*SELECT/i.test(text) &&
    /TOP\s+1/i.test(query) &&
    !/LIMIT\s+1/i.test(text)
    ) {
    text += " LIMIT 1";
    }
  if (returningClause && !/RETURNING/i.test(text)) {
     text += returningClause;
  }
  // Convert SQL Server bit value 1 to PostgreSQL boolean true
  // for IsEmailVerified insert
  text = text.replace(
    /(INSERT\s+INTO\s+Users\s*\([^)]*IsEmailVerified[^)]*\)\s*VALUES\s*\([^)]*),\s*1\s*\)(\s*RETURNING)/i,
    "$1, true)$2"
  );
  // Convert SQL Server bit insert values to PostgreSQL boolean values
text = text.replace(
  /(INSERT\s+INTO\s+Rooms\s*\([^)]*IsPrivate[^)]*\)\s*VALUES\s*\([^)]*),\s*1\s*\)/i,
  "$1, true)"
);

text = text.replace(
  /(INSERT\s+INTO\s+Rooms\s*\([^)]*IsPrivate[^)]*\)\s*VALUES\s*\([^)]*),\s*0\s*\)/i,
  "$1, false)"
);

  return { text, values };
}

class Request {
  constructor() {
    this.params = {};
  }

  input(name, type, value) {
    this.params[name] = value;
    return this;
  }

  async query(queryText) {
    const { text, values } = convertSqlServerToPostgres(queryText, this.params);
    const result = await pgPool.query(text, values);

    return {
      recordset: result.rows.map(normalizeRow),
      rowsAffected: [result.rowCount]
    };
  }
}

const pool = {
  request() {
    return new Request();
  }
};

console.log("Trying PostgreSQL connection...");

const poolConnect = pgPool
  .query("SELECT NOW()")
  .then(() => {
    console.log("✅ Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err);
    throw err;
  });

module.exports = {
  sql,
  pool,
  poolConnect
};