const { pool } = require("../db_pg");

function mapRoom(row) {
  if (!row) return null;

  return {
    Id: row.id,
    Name: row.name,
    IsPrivate: row.isprivate,
    User1Id: row.user1id,
    User2Id: row.user2id,
    CreatedAt: row.createdat,
    LastMessageAt: row.lastmessageat
  };
}

async function findPrivateRoomBetweenUsers(userAId, userBId) {
  const result = await pool.query(
    `
    SELECT id, name, isprivate, user1id, user2id, createdat, lastmessageat
    FROM rooms
    WHERE isprivate = true
      AND (
        (user1id = $1 AND user2id = $2)
        OR
        (user1id = $2 AND user2id = $1)
      )
    LIMIT 1
    `,
    [userAId, userBId]
  );

  return mapRoom(result.rows[0]);
}

async function createPrivateRoom(name, userAId, userBId) {
  const result = await pool.query(
    `
    INSERT INTO rooms (name, isprivate, user1id, user2id)
    VALUES ($1, true, $2, $3)
    RETURNING id, name, isprivate, user1id, user2id, createdat, lastmessageat
    `,
    [name, userAId, userBId]
  );

  return mapRoom(result.rows[0]);
}

module.exports = {
  findPrivateRoomBetweenUsers,
  createPrivateRoom
};