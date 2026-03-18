if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { sql, pool, poolConnect } = require("./db");
console.log("POOL TEST:", pool);
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const pendingUsers = new Map();
let nextPendingId = 1;

const app = express();
app.disable('x-powered-by');
app.use(helmet());
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await poolConnect;
    next();
  } catch (err) {
    console.error("DB not ready:", err);
    res.status(500).send("Database not connected");
  }
});
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "public")));
//ngerngvoenvoinkniujni


// ========== إعداد SMTP (الإيميل) ==========

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationEmail(toEmail, code) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Azizi Chat" <no-reply@azizichat.com>',
    to: toEmail,
    subject: "Azizi Chat - E-posta Doğrulama Kodu",
    text: `Merhaba,

Azizi Chat hesabınızı doğrulamak için kodunuz: ${code}

Kod 10 dakika boyunca geçerlidir.`,
    html: `
      <p>Merhaba,</p>
      <p>Azizi Chat hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
      <h2>${code}</h2>
      <p>Kodun geçerlilik süresi <strong>10 dakikadır</strong>.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// دالة توليد كود التفعيل (6 أرقام)
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// دالة لمعادلة ترتيب اسمين (حتى تكون الغرفة نفسها سواء كتبنا أحمد-محمد أو محمد-أحمد)
function normalizePair(u1, u2) {
  const a = u1.trim();
  const b = u2.trim();
  return a.toLowerCase() < b.toLowerCase() ? [a, b] : [b, a];
}

// إيجاد أو إنشاء غرفة خاصة بين شخصين
async function getOrCreatePrivateRoom(user1, user2) {
  const [nameA, nameB] = normalizePair(user1, user2);

  // جلب Id للمستخدمين
  let request = pool.request();
  const usersRes = await request
    .input("U1", sql.NVarChar(50), nameA)
    .input("U2", sql.NVarChar(50), nameB)
    .query(`
      SELECT Id, Username
      FROM Users
      WHERE Username = @U1 OR Username = @U2
    `);

  if (usersRes.recordset.length !== 2) {
    throw new Error("One of the users not found in Users table");
  }

  let idA, idB;
  for (const row of usersRes.recordset) {
    if (row.Username === nameA) idA = row.Id;
    else idB = row.Id;
  }

  // البحث عن غرفة موجودة مسبقًا
  request = pool.request();
  let roomRes = await request
    .input("IdA", sql.Int, idA)
    .input("IdB", sql.Int, idB)
    .query(`
      SELECT TOP 1 Id FROM Rooms
      WHERE IsPrivate = 1
        AND (
          (User1Id = @IdA AND User2Id = @IdB)
          OR
          (User1Id = @IdB AND User2Id = @IdA)
        )
    `);

  if (roomRes.recordset.length > 0) {
    return { roomId: roomRes.recordset[0].Id, idA, idB, nameA, nameB };
  }

  // إنشاء غرفة جديدة
  request = pool.request();
  const insertRes = await request
    .input("Name", sql.NVarChar(100), `${nameA} - ${nameB}`)
    .input("IdA", sql.Int, idA)
    .input("IdB", sql.Int, idB)
    .query(`
      INSERT INTO Rooms (Name, IsPrivate, User1Id, User2Id)
      OUTPUT Inserted.Id
      VALUES (@Name, 1, @IdA, @IdB)
    `);

  const roomId = insertRes.recordset[0].Id;
  return { roomId, idA, idB, nameA, nameB };
}
// التحقق من صحة الإيميل بصيغة بسيطة
function isValidEmail(email) {
  if (!email) return false;
  // Regex بسيط يناسب مشروعنا
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// تجزئة (تشفير) كلمة المرور
async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

// مقارنة كلمة المرور مع الهاش من قاعدة البيانات
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// 🧑‍🤝‍🧑 API: جلب جميع المستخدمين (للاختيار من القائمة)
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT Id, Username
      FROM Users
      ORDER BY Username
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error while fetching users:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🆕 API: إنشاء مستخدم جديد
app.post("/api/users", async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const cleanName = username.trim();

    let request = pool.request();
    let existing = await request
      .input("Username", sql.NVarChar(50), cleanName)
      .query("SELECT Id FROM Users WHERE Username = @Username");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: "Kullanıcı zaten var" });
    }

    request = pool.request();
    const insertUser = await request
      .input("Username", sql.NVarChar(50), cleanName)
      .input("PasswordHash", sql.NVarChar(255), "dummy")
      .query(`
        INSERT INTO Users (Username, PasswordHash)
        OUTPUT Inserted.Id, Inserted.Username
        VALUES (@Username, @PasswordHash)
      `);

    res.json({ success: true, user: insertUser.recordset[0] });
  } catch (err) {
    console.error("Error while creating user:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🧑‍🤝‍🧑 API: جلب قائمة الأصدقاء المقبولين لمستخدم
app.get("/api/contacts/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    // 1) جلب Id المستخدم
    let request = pool.request();
    const userRes = await request
      .input("Username", sql.NVarChar(50), username)
      .query("SELECT Id FROM Users WHERE Username = @Username");

    if (userRes.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.recordset[0].Id;

    // 2) جلب contacts المقبولين فقط
    request = pool.request();
    const contactsRes = await request
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          u.Username
        FROM Contacts c
        JOIN Users u 
          ON u.Id = c.ContactUserId
        WHERE c.UserId = @UserId
          AND c.Status = 'accepted'
      `);

    res.json(contactsRes.recordset);

  } catch (err) {
    console.error("Error loading contacts:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ API: قبول طلب صداقة
app.post("/api/contacts/accept", async (req, res) => {
  const { contactId } = req.body;

  if (!contactId) {
    return res.status(400).json({ error: "contactId is required" });
  }

  try {
    // 1) جلب الطلب الحالي
    let request = pool.request();
    const contactRes = await request
      .input("Id", sql.Int, contactId)
      .query(`
        SELECT UserId, ContactUserId, Status
        FROM Contacts
        WHERE Id = @Id
      `);

    if (contactRes.recordset.length === 0) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    const contact = contactRes.recordset[0];

    if (contact.Status !== "pending") {
      return res.json({ message: "Request already processed" });
    }

    const userA = contact.UserId;
    const userB = contact.ContactUserId;

    // 2) تحديث الطلب الحالي إلى accepted
    request = pool.request();
    await request
      .input("Id", sql.Int, contactId)
      .query(`
        UPDATE Contacts
        SET Status = 'accepted'
        WHERE Id = @Id
      `);

    // 3) التأكد من وجود السطر العكسي
    request = pool.request();
    const reverseCheck = await request
      .input("A", sql.Int, userB)
      .input("B", sql.Int, userA)
      .query(`
        SELECT Id FROM Contacts
        WHERE UserId = @A AND ContactUserId = @B
      `);

    if (reverseCheck.recordset.length === 0) {
      request = pool.request();
      await request
        .input("A", sql.Int, userB)
        .input("B", sql.Int, userA)
        .query(`
          INSERT INTO Contacts (UserId, ContactUserId, Status)
          VALUES (@A, @B, 'accepted')
        `);
    }

    res.json({ success: true, message: "Contact request accepted" });

  } catch (err) {
    console.error("Error accepting contact:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ❌ API: رفض طلب صداقة
app.post("/api/contacts/reject", async (req, res) => {
  const { contactId } = req.body;

  if (!contactId) {
    return res.status(400).json({ error: "contactId is required" });
  }

  try {
    // 1) جلب الطلب الحالي
    let request = pool.request();
    const contactRes = await request
      .input("Id", sql.Int, contactId)
      .query(`
        SELECT UserId, ContactUserId, Status
        FROM Contacts
        WHERE Id = @Id
      `);

    if (contactRes.recordset.length === 0) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    const contact = contactRes.recordset[0];

    if (contact.Status !== "pending") {
      return res.json({ message: "Request already processed" });
    }

    // 2) حذف الطلب
    request = pool.request();
    await request
      .input("Id", sql.Int, contactId)
      .query(`
        DELETE FROM Contacts
        WHERE Id = @Id
      `);

    res.json({ success: true, message: "Contact request rejected" });

  } catch (err) {
    console.error("Error rejecting contact:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// 📨 API: جلب طلبات الصداقة الواردة (pending)
app.get("/api/contacts/requests/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    // 1) جلب Id المستخدم
    let request = pool.request();
    const userRes = await request
      .input("Username", sql.NVarChar(50), username)
      .query("SELECT Id FROM Users WHERE Username = @Username");

    if (userRes.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.recordset[0].Id;

    // 2) جلب الطلبات الواردة pending
    request = pool.request();
    const pendingRes = await request
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          c.Id AS ContactId,
          u.Username AS FromUser
        FROM Contacts c
        JOIN Users u ON u.Id = c.UserId
        WHERE c.ContactUserId = @UserId
          AND c.Status = 'pending'
      `);

    res.json(pendingRes.recordset);

  } catch (err) {
    console.error("Error loading pending requests:", err);
    res.status(500).json({ error: "DB error" });
  }
});


app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1) التحقق من المدخلات
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "يجب إدخال اسم المستخدم" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "يجب إدخال البريد الإلكتروني" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date();

    // 2) فحص صيغة الإيميل
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صالحة" });
    }

    // 3) التأكد من عدم وجود مستخدم نهائي بنفس الاسم أو الإيميل في جدول Users
    let request = pool.request();
    const existingFinal = await request
      .input("Username", sql.NVarChar(50), cleanUsername)
      .input("Email", sql.NVarChar(100), cleanEmail)
      .query(`
        SELECT TOP 1 Id, Username, Email
        FROM Users
        WHERE Username = @Username OR Email = @Email
      `);

    if (existingFinal.recordset.length > 0) {
      const found = existingFinal.recordset[0];

      if (found.Username === cleanUsername) {
        return res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل" });
      }
      if (found.Email && found.Email.toLowerCase() === cleanEmail) {
        return res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل من قبل" });
      }
    }

    // 4) البحث عن طلب pending في الذاكرة لنفس الإيميل أو نفس اسم المستخدم
    let existingPendingId = null;
    let existingPending   = null;

    for (const [id, p] of pendingUsers.entries()) {
      const sameUser =
        p.username.toLowerCase() === cleanUsername.toLowerCase() ||
        p.email.toLowerCase() === cleanEmail.toLowerCase();

      if (sameUser) {
        existingPendingId = id;
        existingPending   = p;
        break;
      }
    }

    // ===== حالة: يوجد طلب سابق قيد التفعيل لنفس الإيميل/اليوزر =====
    if (existingPending) {
      const p = existingPending;

      // تأكد أن حقول الـ rate-limit موجودة
      if (typeof p.resendCount !== "number") {
        p.resendCount = 0;
      }

      // لو فيه وقت محدد للسماح القادم ولم يحن بعد → منع
      if (p.nextResendTime && now < p.nextResendTime) {
        const diffMs = p.nextResendTime - now;
        const diffMinutes = Math.ceil(diffMs / 60000);

        let msg;
        if (diffMinutes < 60) {
          msg = `تم إرسال كود التفعيل مسبقًا، يرجى المحاولة بعد حوالي ${diffMinutes} دقيقة.`;
        } else {
          const diffHours = Math.ceil(diffMinutes / 60);
          msg = `تم إرسال كود التفعيل مسبقًا، يرجى المحاولة بعد حوالي ${diffHours} ساعة.`;
        }

        return res.status(429).json({ error: msg });
      }

      p.username = cleanUsername;
      p.email    = cleanEmail;
      p.passwordHash = await hashPassword(password);

      // توليد كود جديد + صلاحية 10 دقائق
      const newCode = generateVerificationCode();
      p.code      = newCode;
      p.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // تحديث عدد مرات الإعادة
      p.resendCount += 1;

          let delayMs;
      if (p.resendCount === 1) {
        delayMs = 1 * 60 * 1000;          // 1 دقيقة
      } else if (p.resendCount === 2) {
        delayMs = 60 * 60 * 1000;         // 1 ساعة
      } else {
        delayMs = 24 * 60 * 60 * 1000;    // 24 ساعة
      }

      p.nextResendTime = new Date(Date.now() + delayMs);

      // إرسال الإيميل بالكود الجديد
      try {
        await sendVerificationEmail(p.email, newCode);
        console.log("Resent verification email to:", p.email, "code:", newCode);
      } catch (emailErr) {
        console.error("Error resending verification email:", emailErr);
        return res
          .status(500)
          .json({ error: "فشل إرسال كود التفعيل، حاول لاحقًا." });
      }

      // نرجع نفس pendingId لأن الحساب لم يُنشأ بعد في Users
      return res.json({
        success: true,
        message: "تم إرسال كود تفعيل جديد إلى بريدك الإلكتروني.",
        userId: existingPendingId,
        user: {
          Id: existingPendingId,
          Username: p.username,
          Email: p.email
        }
      });
    }

   
    const passwordHash = await hashPassword(password);

    // توليد كود التفعيل الأول + صلاحية 10 دقائق
    const code      = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const pendingId = nextPendingId++;
    pendingUsers.set(pendingId, {
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      code,
      expiresAt,
      resendCount: 0,                                      // لم تتم إعادة إرسال بعد
      nextResendTime: new Date(now.getTime() + 1 * 60 * 1000) // بعد دقيقة يسمح بالطلب التالي
    });

    try {
      await sendVerificationEmail(cleanEmail, code);
      console.log("Verification email sent to:", cleanEmail, "code:", code);
    } catch (emailErr) {
      console.error("Error sending verification email:", emailErr);
        }

    return res.json({
      success: true,
      message: "تم إنشاء الطلب، تم إرسال كود التفعيل إلى بريدك الإلكتروني.",
      userId: pendingId,
      user: {
        Id: pendingId,
        Username: cleanUsername,
        Email: cleanEmail
      }
    });

  } catch (err) {
    console.error("Error in /api/register:", err);
    return res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

app.post("/api/verify-email", async (req, res) => {
  const { userId, code } = req.body; // userId هنا = pendingId من الذاكرة

  if (!userId || !code) {
    return res.status(400).json({ error: "userId و code مطلوبان" });
  }

  try {
    const pendingId = parseInt(userId, 10);
    if (isNaN(pendingId)) {
      return res.status(400).json({ error: "userId غير صالح" });
    }

    const pending = pendingUsers.get(pendingId);
    if (!pending) {
      return res.status(400).json({ error: "لا يوجد طلب تفعيل مطابق أو انتهت صلاحيته" });
    }

    // التحقق من الكود
    if (pending.code !== code.trim()) {
      return res.status(400).json({ error: "الكود غير صحيح" });
    }

    // التحقق من وقت الانتهاء
    const now = new Date();
    if (pending.expiresAt < now) {
      pendingUsers.delete(pendingId);
      return res.status(400).json({ error: "انتهت صلاحية هذا الكود، قم بإعادة التسجيل من جديد." });
    }

    // 1) إنشاء المستخدم الحقيقي في جدول Users مع IsEmailVerified = 1
    let request = pool.request();
    const insertUser = await request
      .input("Username", sql.NVarChar(50), pending.username)
      .input("Email", sql.NVarChar(100), pending.email)
      .input("PasswordHash", sql.NVarChar(255), pending.passwordHash)
      .query(`
        INSERT INTO Users (Username, Email, PasswordHash, IsEmailVerified)
        OUTPUT Inserted.Id, Inserted.Username, Inserted.Email, Inserted.IsEmailVerified
        VALUES (@Username, @Email, @PasswordHash, 1)
      `);

    const user = insertUser.recordset[0];

    // 2) حذف الطلب من الذاكرة
    pendingUsers.delete(pendingId);

    return res.json({
      success: true,
      message: "تم تفعيل البريد الإلكتروني وإنشاء الحساب بنجاح.",
      user: {
        Id: user.Id,
        Username: user.Username,
        Email: user.Email
      }
    });

  } catch (err) {
    console.error("Error in /api/verify-email:", err);
    return res.status(500).json({ error: "خطأ في السيرفر" });
  }
});
// 🔐 API: تسجيل الدخول بواسطة (إيميل أو اسم مستخدم) + كلمة مرور
app.post("/api/login", async (req, res) => {
  try {
    //await poolConnect; // 🔥 مهم جداً

    const { login, password } = req.body;

    const result = await pool.request()
      .input("Login", sql.NVarChar(100), login.trim())
      .query(`
        SELECT TOP 1 Id, Username, Email, PasswordHash
        FROM Users
        WHERE Username = @Login OR Email = @Login
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "المستخدم غير موجود" });
    }

    const user = result.recordset[0];

    const isMatch = await comparePassword(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    }

    await pool.request()
      .input("Id", sql.Int, user.Id)
      .query("UPDATE Users SET LastLogin = SYSDATETIME() WHERE Id = @Id");

    res.json({ success: true, user });

  } catch (err) {
    console.error("Error in /api/login:", err);
    res.status(500).send("Server error");
  }
});

// 📨 API: جلب رسائل محادثة بين شخصين (تاريخ المحادثة)
app.get("/api/messages", async (req, res) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "user1 and user2 are required" });
  }

  try {
    const { roomId } = await getOrCreatePrivateRoom(user1, user2);

    let request = pool.request();
    const result = await request
      .input("RoomId", sql.Int, roomId)
      .query(`
        SELECT m.Id, m.Content, m.CreatedAt, u.Username
        FROM Messages m
        JOIN Users u ON m.UserId = u.Id
        WHERE m.RoomId = @RoomId
        ORDER BY m.CreatedAt ASC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error while fetching messages:", err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/contacts/request", async (req, res) => {
  const { senderUsername, username } = req.body;

  if (!senderUsername) {
    return res.status(400).json({ error: "senderUsername is required" });
  }

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    // جلب Id المستخدم المرسل
    let request = pool.request();
    const senderResult = await request
      .input("senderUsername", sql.NVarChar(50), senderUsername.trim())
      .query("SELECT Id FROM Users WHERE Username = @senderUsername");

    if (senderResult.recordset.length === 0) {
      return res.status(404).json({ error: "المستخدم المرسل غير موجود" });
    }

    const senderId = senderResult.recordset[0].Id;

    // جلب المستخدم المستقبل
    const trimmedUsername = username.trim();
    request = pool.request();
    const userResult = await request
      .input("username", sql.NVarChar(50), trimmedUsername)
      .query("SELECT Id FROM Users WHERE Username = @username");

    if (userResult.recordset.length === 0) {
      console.log(`User not found: "${trimmedUsername}"`);
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    const receiverId = userResult.recordset[0].Id;

    // منع إرسال طلب لنفسك
    if (senderId === receiverId) {
      return res.status(400).json({ error: "لا يمكنك إضافة نفسك" });
    }

    // التحقق من وجود علاقة موجودة (مقبولة أو قيد الانتظار)
    request = pool.request();
    const check = await request
      .input("u1", sql.Int, senderId)
      .input("u2", sql.Int, receiverId)
      .query(`
        SELECT Status FROM Contacts
        WHERE (UserId = @u1 AND ContactUserId = @u2)
           OR (UserId = @u2 AND ContactUserId = @u1)
      `);

    if (check.recordset.length > 0) {
      const status = check.recordset[0].Status;
      if (status === 'accepted') {
        return res.status(409).json({ error: "هذا المستخدم موجود بالفعل ضمن جهات اتصالك" });
      } else if (status === 'pending') {
        return res.status(409).json({ error: "تم إرسال طلب صداقة لهذا المستخدم مسبقاً وهو قيد الانتظار" });
      }
    }

    // إدخال الطلب
    request = pool.request();
    await request
      .input("u1", sql.Int, senderId)
      .input("u2", sql.Int, receiverId)
      .query(`
        INSERT INTO Contacts (UserId, ContactUserId, Status)
        VALUES (@u1, @u2, 'pending')
      `);

    res.json({ success: true, message: "تم إرسال طلب الصداقة بنجاح" });

  } catch (err) {
    console.error("Error in /api/contacts/request:", err);
    res.status(500).json({ error: "خطأ في السيرفر: " + err.message });
  }
});

// 🔌 Socket.io
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // الانضمام إلى غرفة (محادثة ثنائية) بين شخصين
  socket.on("joinRoom", async ({ user1, user2 }) => {
    if (!user1 || !user2) return;

    try {
      const { roomId } = await getOrCreatePrivateRoom(user1, user2);
      const roomName = `room_${roomId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    } catch (err) {
      console.error("Error in joinRoom:", err);
    }
  });

  // إرسال رسالة خاصة بين شخصين
  socket.on("chatMessage", async ({ from, to, text }) => {
    if (!from || !to || !text) return;

    try {
      const { roomId } = await getOrCreatePrivateRoom(from, to);

      // جلب Id للمُرسل
      let request = pool.request();
      const userRes = await request
        .input("Username", sql.NVarChar(50), from)
        .query("SELECT Id FROM Users WHERE Username = @Username");

      if (userRes.recordset.length === 0) {
        console.error("Sender user not found in DB");
        return;
      }

      const userId = userRes.recordset[0].Id;

      // إدخال الرسالة في Messages (استخدم SCOPE_IDENTITY بدلاً من OUTPUT)
      request = pool.request();
      const insertRes = await request
        .input("RoomId", sql.Int, roomId)
        .input("UserId", sql.Int, userId)
        .input("Content", sql.NVarChar(sql.MAX), text)
        .query(`
          INSERT INTO Messages (RoomId, UserId, Content)
          VALUES (@RoomId, @UserId, @Content);
          SELECT TOP 1 Id, CreatedAt FROM Messages WHERE Id = SCOPE_IDENTITY();
        `);

      const inserted = insertRes.recordset && insertRes.recordset[0];

      const msgToSend = {
        from,
        to,
        text,
        createdAt: inserted.CreatedAt
      };

      const roomName = `room_${roomId}`;
      // نرسل الرسالة فقط للي في الغرفة (الطرفين)
      io.to(roomName).emit("chatMessage", msgToSend);
    } catch (err) {
      console.error("Error while inserting private message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

(async () => {
  try {
    await poolConnect;  // 🔥 انتظر الاتصال

    console.log("✅ DB Ready");

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect DB:", err);
    process.exit(1);
  }
})();
