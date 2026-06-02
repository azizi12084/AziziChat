const { pool } = require("../db_pg");

function mapMessage(row) {
  if (!row) return null;

  return {
    Id: row.id,
    RoomId: row.roomid,
    UserId: row.userid,
    Content: row.content,
    MessageType: row.messagetype || "text",
    MediaData: row.mediadata,
    MediaName: row.medianame,
    MediaMime: row.mediamime,
    MediaSize: row.mediasize,
    CreatedAt: row.createdat,
    IsRead: row.isread,
    IsDeleted: row.isdeleted,
    Username: row.username
  };
}

async function getMessagesByRoomId(roomId) {
  const result = await pool.query(
    `
    SELECT
      m.id,
      m.roomid,
      m.userid,
      m.content,
      m.messagetype,
      m.mediadata,
      m.medianame,
      m.mediamime,
      m.mediasize,
      m.createdat,
      m.isread,
      m.isdeleted,
      u.username
    FROM messages m
    JOIN users u
      ON m.userid = u.id
    WHERE m.roomid = $1
      AND m.isdeleted = FALSE
    ORDER BY m.createdat ASC
    `,
    [roomId]
  );

  return result.rows.map(mapMessage);
}

async function createTextMessage(roomId, userId, content) {
  const result = await pool.query(
    `
    INSERT INTO messages (roomid, userid, content, messagetype)
    VALUES ($1, $2, $3, 'text')
    RETURNING
      id,
      roomid,
      userid,
      content,
      messagetype,
      mediadata,
      medianame,
      mediamime,
      mediasize,
      createdat,
      isread,
      isdeleted
    `,
    [roomId, userId, content]
  );

  return mapMessage(result.rows[0]);
}

async function createImageMessage(roomId, userId, media) {
  const result = await pool.query(
    `
    INSERT INTO messages (
      roomid,
      userid,
      content,
      messagetype,
      mediadata,
      medianame,
      mediamime,
      mediasize
    )
    VALUES ($1, $2, '', 'image', $3, $4, $5, $6)
    RETURNING
      id,
      roomid,
      userid,
      content,
      messagetype,
      mediadata,
      medianame,
      mediamime,
      mediasize,
      createdat,
      isread,
      isdeleted
    `,
    [
      roomId,
      userId,
      media.data,
      media.name,
      media.mime,
      media.size
    ]
  );

  return mapMessage(result.rows[0]);
}

// مؤقتًا نحافظ على الاسم القديم حتى لا ينكسر server.js
async function createMessage(roomId, userId, content) {
  return createTextMessage(roomId, userId, content);
}

module.exports = {
  getMessagesByRoomId,
  createMessage,
  createTextMessage,
  createImageMessage
};