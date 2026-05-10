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

async function getPendingRequestsByUsername(username) {
  const result = await pool.query(
    `
    SELECT
      c.id AS contactid,
      u.username AS fromuser
    FROM contacts c
    JOIN users u
      ON u.id = c.userid
    JOIN users receiver
      ON receiver.id = c.contactuserid
    WHERE receiver.username = $1
      AND c.status = 'pending'
    ORDER BY c.createdat DESC
    `,
    [username]
  );

  return result.rows.map(mapContact);
}

async function findContactById(contactId) {
  const result = await pool.query(
    `
    SELECT userid, contactuserid, status
    FROM contacts
    WHERE id = $1
    `,
    [contactId]
  );

  return mapContact(result.rows[0]);
}

async function deleteContactById(contactId) {
  await pool.query(
    `
    DELETE FROM contacts
    WHERE id = $1
    `,
    [contactId]
  );
}
module.exports = {
  getAcceptedContactsByUsername,
  findContactById,
  deleteContactById,
  getPendingRequestsByUsername
};
