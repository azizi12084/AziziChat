if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { sql, pool, poolConnect } = require("./db_postgres_compat");
const usersDb = require("./db/users");
const contactsDb = require("./db/contacts");
const roomsDb = require("./db/rooms");
const messagesDb = require("./db/messages");
const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const pendingUsers = new Map();
let nextPendingId = 1;

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: false,
      originAgentCluster: false
    })
  );
}


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


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationEmail(toEmail, code) {
  if (process.env.EMAIL_PROVIDER === "resend") {
    console.log("Using Resend email provider");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Azizi Chat <onboarding@resend.dev>",
      to: toEmail,
      subject: "Azizi Chat - E-posta Doğrulama Kodu",
      html: `
        <p>Merhaba,</p>
        <p>Azizi Chat hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
        <h2>${code}</h2>
        <p>Kodun geçerlilik süresi <strong>10 dakikadır</strong>.</p>
      `,
      text: `Merhaba,

Azizi Chat hesabınızı doğrulamak için kodunuz: ${code}

Kod 10 dakika boyunca geçerlidir.`
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message || "Resend email failed");
    }

    console.log("Resend email sent:", data);
    return;
  }

  console.log("Using SMTP email provider");

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
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

  const userA = await usersDb.findUserByUsername(nameA);
  const userB = await usersDb.findUserByUsername(nameB);

  if (!userA || !userB) {
    throw new Error("One of the users not found in Users table");
  }

  const existingRoom = await roomsDb.findPrivateRoomBetweenUsers(userA.Id, userB.Id);

  if (existingRoom) {
    return {
      roomId: existingRoom.Id,
      idA: userA.Id,
      idB: userB.Id,
      nameA,
      nameB
    };
  }

  const newRoom = await roomsDb.createPrivateRoom(
    `${nameA} - ${nameB}`,
    userA.Id,
    userB.Id
  );

  return {
    roomId: newRoom.Id,
    idA: userA.Id,
    idB: userB.Id,
    nameA,
    nameB
  };
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
    const users = await usersDb.getAllUsers();
    res.json(users);
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
    const existing = await usersDb.findUserByUsername(cleanName);

    if (existing) {
      return res.status(409).json({ error: "Kullanıcı zaten var" });
    }

    const user = await usersDb.createBasicUser(cleanName, "dummy");

    res.json({ success: true, user });

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
    const contacts = await contactsDb.getAcceptedContactsByUsername(username);
    res.json(contacts);
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
    const contact = await contactsDb.findContactById(contactId);

    if (!contact) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    if (contact.Status !== "pending") {
      return res.json({ message: "Request already processed" });
    }

    const userA = contact.UserId;
    const userB = contact.ContactUserId;

    await contactsDb.acceptContactById(contactId);

    const reverseContact = await contactsDb.findContactBetweenUsers(userB, userA);

    if (!reverseContact) {
      await contactsDb.createAcceptedContact(userB, userA);
    }

    res.json({ success: true, message: "Contact request accepted" });

  } catch (err) {
    console.error("Error accepting contact:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر. حاول لاحقًا." });
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
    const contact = await contactsDb.findContactById(contactId);

    if (!contact) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    if (contact.Status !== "pending") {
      return res.json({ message: "Request already processed" });
    }

    await contactsDb.deleteContactById(contactId);

    res.json({ success: true, message: "Contact request rejected" });

  } catch (err) {
    console.error("Error rejecting contact:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر. حاول لاحقًا." });
  }
});

// 📨 API: جلب طلبات الصداقة الواردة (pending)
app.get("/api/contacts/requests/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const requests = await contactsDb.getPendingRequestsByUsername(username);
    res.json(requests);
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

    const found = await usersDb.findUserByUsernameOrEmail(cleanUsername, cleanEmail);

    if (found) {
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
        console.log("Resent verification email to:", p.email);
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
      console.log("Verification email sent to:", cleanEmail);
    } catch (emailErr) {
      console.error("Error sending verification email:", emailErr);
      pendingUsers.delete(pendingId);
      return res.status(500).json({
        error: "فشل إرسال كود التفعيل. حاول مرة أخرى لاحقًا."
      });


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

    const user = await usersDb.createVerifiedUser(
      pending.username,
      pending.email,
      pending.passwordHash
    );

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

    const user = await usersDb.findUserForLogin(login.trim());

    if (!user) {
      return res.status(401).json({ error: "المستخدم غير موجود" });
    }

    const isMatch = await comparePassword(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    }

    await usersDb.updateLastLogin(user.Id);
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
    const messages = await messagesDb.getMessagesByRoomId(roomId);
    res.json(messages);
    
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
    const sender = await usersDb.findUserByUsername(senderUsername.trim());

    if (!sender) {
      return res.status(404).json({ error: "المستخدم المرسل غير موجود" });
    }

    const trimmedUsername = username.trim();
    const receiver = await usersDb.findUserByUsername(trimmedUsername);

    if (!receiver) {
      console.log(`User not found: "${trimmedUsername}"`);
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    const senderId = sender.Id;
    const receiverId = receiver.Id;

    if (senderId === receiverId) {
      return res.status(400).json({ error: "لا يمكنك إضافة نفسك" });
    }

    const existingRelationship = await contactsDb.findContactRelationship(
      senderId,
      receiverId
    );

    if (existingRelationship) {
      const status = existingRelationship.Status;

      if (status === "accepted") {
        return res.status(409).json({ error: "هذا المستخدم موجود بالفعل ضمن جهات اتصالك" });
      }

      if (status === "pending") {
        return res.status(409).json({ error: "تم إرسال طلب صداقة لهذا المستخدم مسبقاً وهو قيد الانتظار" });
      }
    }

    await contactsDb.createPendingContactRequest(senderId, receiverId);

    res.json({ success: true, message: "تم إرسال طلب الصداقة بنجاح" });

  } catch (err) {
    console.error("Error in /api/contacts/request:", err);
    res.status(500).json({ error: "خطأ في السيرفر: حاول لاحقا" });
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
      const sender = await usersDb.findUserByUsername(from);

      if (!sender) {
        console.error("Sender user not found in DB");
        return;
      }

      const inserted = await messagesDb.createMessage(roomId, sender.Id, text);
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
