const { pool } = require("../db_pg");

function mapContact(row) {
  if (!row) return null;

  return {
    ContactId: row.contactid,
    FromUser: row.fromuser,
    Username: row.username,
    Status: row.status,
    UserId: row.userid,
    ContactUserId: row.contactuserid
  };
}

async function getAcceptedContactsByUsername(username) {
  const result = await pool.query(
    `
    SELECT u.username
    FROM contacts c
    JOIN users u
      ON u.id = c.contactuserid
    JOIN users owner
      ON owner.id = c.userid
    WHERE owner.username = $1
      AND c.status = 'accepted'
    ORDER BY u.username
    `,
    [username]
  );

  return result.rows.map(mapContact);
}

module.exports = {
  getAcceptedContactsByUsername
};