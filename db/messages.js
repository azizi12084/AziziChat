const { pool } = require("../db_pg");

function mapMessage(row) {
  if (!row) return null;

  return {
    Id: row.id,
    RoomId: row.roomid,
    UserId: row.userid,
    Content: row.content,
    CreatedAt: row.createdat,
    IsRead: row.isread,
    IsDeleted: row.isdeleted,
    Username: row.username
  };
}

async function getMessagesByRoomId(roomId) {
  const result = await pool.query(
    `
    SELECT m.id, m.roomid, m.userid, m.content, m.createdat, u.username
    FROM messages m
    JOIN users u
      ON m.userid = u.id
    WHERE m.roomid = $1
    ORDER BY m.createdat ASC
    `,
    [roomId]
  );

  return result.rows.map(mapMessage);
}

async function createMessage(roomId, userId, content) {
  const result = await pool.query(
    `
    INSERT INTO messages (roomid, userid, content)
    VALUES ($1, $2, $3)
    RETURNING id, createdat
    `,
    [roomId, userId, content]
  );

  return mapMessage(result.rows[0]);
}

module.exports = {
  getMessagesByRoomId,
  createMessage
};