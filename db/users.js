const { pool } = require("../db_pg");

function mapUser(row) {
  if (!row) return null;

  return {
    Id: row.id,
    Username: row.username,
    Email: row.email,
    PasswordHash: row.passwordhash,
    IsEmailVerified: row.isemailverified,
    CreatedAt: row.createdat,
    LastLogin: row.lastlogin,
    IsActive: row.isactive
  };
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT id, username
    FROM users
    WHERE username = $1
    `,
    [username]
  );

  return mapUser(result.rows[0]);
}

async function createBasicUser(username, passwordHash) {
  const result = await pool.query(
    `
    INSERT INTO users (username, passwordhash)
    VALUES ($1, $2)
    RETURNING id, username
    `,
    [username, passwordHash]
  );

  return mapUser(result.rows[0]);
}

async function findUserByUsernameOrEmail(username, email) {
  const result = await pool.query(
    `
    SELECT id, username, email
    FROM users
    WHERE username = $1 OR email = $2
    LIMIT 1
    `,
    [username, email]
  );

  return mapUser(result.rows[0]);
}

async function createVerifiedUser(username, email, passwordHash) {
  const result = await pool.query(
    `
    INSERT INTO users (username, email, passwordhash, isemailverified)
    VALUES ($1, $2, $3, true)
    RETURNING id, username, email, isemailverified
    `,
    [username, email, passwordHash]
  );

  return mapUser(result.rows[0]);
}

async function findUserForLogin(login) {
  const result = await pool.query(
    `
    SELECT id, username, email, passwordhash
    FROM users
    WHERE username = $1 OR email = $1
    LIMIT 1
    `,
    [login]
  );

  return mapUser(result.rows[0]);
}

async function updateLastLogin(userId) {
  await pool.query(
    `
    UPDATE users
    SET lastlogin = NOW()
    WHERE id = $1
    `,
    [userId]
  );
}

module.exports = {
  findUserByUsername,
  createBasicUser,
  findUserByUsernameOrEmail,
  createVerifiedUser,
  findUserForLogin,
  updateLastLogin
};