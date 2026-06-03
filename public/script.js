"use strict";

const socket = io();

const loginSection = document.getElementById("loginSection");
const chatSection  = document.getElementById("chatSection");
const languageSection = document.getElementById("languageSection");
const languageStartSelect = document.getElementById("languageStartSelect");
const btnStartLanguage = document.getElementById("btnStartLanguage");

// عناصر واجهة الدخول الجديدة
const loginIdentifierInput = document.getElementById("loginIdentifier");
const loginPasswordInput   = document.getElementById("loginPassword");
const btnLogin             = document.getElementById("btnLogin");

const regUsernameInput = document.getElementById("regUsername");
const regEmailInput    = document.getElementById("regEmail");
const regPasswordInput = document.getElementById("regPassword");
const btnRegister      = document.getElementById("btnRegister");

// عناصر تفعيل البريد
const verifyBox       = document.getElementById("verifyBox");
const verifyCodeInput = document.getElementById("verifyCode");
const btnVerifyCode   = document.getElementById("btnVerifyCode");

// عناصر الشات
const contactsList   = document.getElementById("contactsList");
const contactsSearch = document.getElementById("contactsSearch");
const messagesDiv    = document.getElementById("messages");

const chatForm       = document.getElementById("chatForm");
const messageInput   = document.getElementById("message");
const mediaInput = document.getElementById("mediaInput");
const btnChooseMedia = document.getElementById("btnChooseMedia");
const selectedMediaPreview = document.getElementById("selectedMediaPreview");
const btnVoiceRecord = document.getElementById("btnVoiceRecord");
const voicePreview = document.getElementById("voicePreview");
const contactsSection = document.querySelector('.contacts-section');
const mainArea = document.querySelector('.main');
const btnBackToContacts = document.getElementById('btnBackToContacts');
const chatHeader = document.getElementById('chatHeader');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderStatus = document.getElementById('chatHeaderStatus');

// عناصر إدارة جهات الاتصال
const contactsTabs = document.querySelectorAll(".contacts-tab");
const contactsPanels = document.querySelectorAll(".contacts-panel");
const newContactUsernameInput = document.getElementById("newContactUsername");
const btnSendContactRequest = document.getElementById("btnSendContactRequest");
const contactRequestMessage = document.getElementById("contactRequestMessage");
const pendingRequestsList = document.getElementById("pendingRequestsList");

// إعادة إرسال الكود + العداد
const btnResendCode     = document.getElementById("btnResendCode");
const verifyTimer       = document.getElementById("verifyTimer");
const verifyTimerValue  = document.getElementById("verifyTimerValue");
const verifyTimerPrefix = document.getElementById("verifyTimerPrefix");
const verifyTimerUnit   = document.getElementById("verifyTimerUnit");

// جسم نموذج الدخول/التسجيل + زر الرجوع
const authBody          = document.querySelector(".auth-body");
const btnBackToRegister = document.getElementById("btnBackToRegister");

// تبويبات واجهة الدخول
const authTabs   = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");

// صندوق الرسائل في شاشة الدخول
const authAlertBox = document.getElementById("authAlert");

let verifyTimerInterval = null;

let currentUser   = null;
let activePartner = null;
let pendingUploadMessage = null;
let mediaRecorder = null;
let voiceChunks = [];
let selectedVoiceBlob = null;
let selectedVoiceMime = "";
let isRecordingVoice = false;

function applyLanguage(langOverride) {
  const lang = langOverride || getCurrentLanguage();
  const isArabic = lang === "ar";

  document.documentElement.lang = lang;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.body.dir = isArabic ? "rtl" : "ltr";

  document.body.classList.toggle("rtl", isArabic);
  document.body.classList.toggle("ltr", !isArabic);

  if (languageStartSelect) {
    languageStartSelect.value = lang;
  }

  const languageTitle = document.getElementById("languageTitle");
  if (languageTitle) languageTitle.textContent = t("languageTitle", lang);

  const languageSubtitle = document.getElementById("languageSubtitle");
  if (languageSubtitle) languageSubtitle.textContent = t("languageSubtitle", lang);

  if (btnStartLanguage) btnStartLanguage.textContent = t("startButton", lang);

  const authSubtitle = document.querySelector(".auth-subtitle");
  if (authSubtitle) authSubtitle.textContent = t("appSubtitle", lang);

  const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
  if (loginTab) loginTab.textContent = t("loginTab", lang);

  const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
  if (registerTab) registerTab.textContent = t("registerTab", lang);

  const loginIdentifierLabel = document.querySelector('label[for="loginIdentifier"]');
  if (loginIdentifierLabel) loginIdentifierLabel.textContent = t("loginIdentifierLabel", lang);
  if (loginIdentifierInput) loginIdentifierInput.placeholder = t("loginIdentifierPlaceholder", lang);

  const loginPasswordLabel = document.querySelector('label[for="loginPassword"]');
  if (loginPasswordLabel) loginPasswordLabel.textContent = t("loginPasswordLabel", lang);
  if (loginPasswordInput) loginPasswordInput.placeholder = t("loginPasswordPlaceholder", lang);

  if (btnLogin) btnLogin.textContent = t("loginButton", lang);

  const regUsernameLabel = document.querySelector('label[for="regUsername"]');
  if (regUsernameLabel) regUsernameLabel.textContent = t("registerUsernameLabel", lang);
  if (regUsernameInput) regUsernameInput.placeholder = t("registerUsernamePlaceholder", lang);

  const regEmailLabel = document.querySelector('label[for="regEmail"]');
  if (regEmailLabel) regEmailLabel.textContent = t("registerEmailLabel", lang);
  if (regEmailInput) regEmailInput.placeholder = t("registerEmailPlaceholder", lang);

  const regPasswordLabel = document.querySelector('label[for="regPassword"]');
  if (regPasswordLabel) regPasswordLabel.textContent = t("registerPasswordLabel", lang);
  if (regPasswordInput) regPasswordInput.placeholder = t("registerPasswordPlaceholder", lang);

  if (btnRegister) btnRegister.textContent = t("registerButton", lang);

  const verifyTitle = document.querySelector(".verify-title");
  if (verifyTitle) verifyTitle.textContent = t("verifyTitle", lang);

  const verifyText = document.querySelector(".verify-text");
  if (verifyText) verifyText.textContent = t("verifyText", lang);

  const verifyCodeLabel = document.querySelector('label[for="verifyCode"]');
  if (verifyCodeLabel) verifyCodeLabel.textContent = t("verifyCodeLabel", lang);

  if (verifyCodeInput) verifyCodeInput.placeholder = t("verifyCodePlaceholder", lang);
  if (btnVerifyCode) btnVerifyCode.textContent = t("verifyButton", lang);
  if (btnResendCode) btnResendCode.textContent = t("resendCodeButton", lang);
  if (btnBackToRegister) btnBackToRegister.textContent = t("backToRegister", lang);

  if (verifyTimerPrefix) verifyTimerPrefix.textContent = t("resendTimerPrefix", lang);
  if (verifyTimerUnit) verifyTimerUnit.textContent = t("secondsWord", lang);

  const authFooterText = document.querySelector(".auth-footer-text");
  if (authFooterText) authFooterText.textContent = t("authFooterText", lang);

  const contactsTab = document.querySelector('.contacts-tab[data-tab="contacts"]');
  if (contactsTab) contactsTab.textContent = t("contactsTab", lang);

  const addContactTab = document.querySelector('.contacts-tab[data-tab="add-contact"]');
  if (addContactTab) addContactTab.textContent = t("addContactTab", lang);

  const requestsTab = document.querySelector('.contacts-tab[data-tab="requests"]');
  if (requestsTab) requestsTab.textContent = t("requestsTab", lang);

  if (contactsSearch) contactsSearch.placeholder = t("contactsSearchPlaceholder", lang);

  const addContactTitle = document.querySelector(".add-contact-form h3");
  if (addContactTitle) addContactTitle.textContent = t("addContactTitle", lang);

  const newContactUsernameLabel = document.querySelector('label[for="newContactUsername"]');
  if (newContactUsernameLabel) newContactUsernameLabel.textContent = t("newContactUsernameLabel", lang);

  if (newContactUsernameInput) {
    newContactUsernameInput.placeholder = t("newContactUsernamePlaceholder", lang);
  }

  if (btnSendContactRequest) {
    btnSendContactRequest.textContent = t("sendContactRequestButton", lang);
  }

  const requestsTitle = document.querySelector('.contacts-panel[data-panel="requests"] h3');
  if (requestsTitle) requestsTitle.textContent = t("pendingRequestsTitle", lang);

  if (chatHeaderStatus) chatHeaderStatus.textContent = t("chatOnline", lang);

  const noChatSelected = document.querySelector(".no-chat-selected");
  if (noChatSelected) noChatSelected.textContent = t("noChatSelected", lang);

  if (messageInput) messageInput.placeholder = t("messagePlaceholder", lang);

  const sendButton = document.querySelector('#chatForm button[type="submit"]');
  if (sendButton) sendButton.textContent = t("sendButton", lang);
  if (btnChooseMedia) {
      btnChooseMedia.title = t("chooseImageTitle", lang);
  }
  if (btnVoiceRecord) {
    btnVoiceRecord.title = t("recordVoiceTitle", lang);
  }
  if (mediaInput && mediaInput.files && mediaInput.files[0] && messageInput) {
    messageInput.placeholder = t("imageSelectedPlaceholder", lang);
  }
}

function showInitialScreen() {
  if (languageStartSelect) {
    languageStartSelect.value = "en";
  }

  applyLanguage("en");

  if (languageSection) languageSection.style.display = "flex";
  if (loginSection) loginSection.style.display = "none";
  if (chatSection) chatSection.style.display = "none";
}

if (languageStartSelect) {
  languageStartSelect.addEventListener("change", () => {
    applyLanguage(languageStartSelect.value);
  });
}

if (btnStartLanguage) {
  btnStartLanguage.addEventListener("click", () => {
    const selectedLang = languageStartSelect.value;

    setCurrentLanguage(selectedLang);
    applyLanguage(selectedLang);

    if (languageSection) languageSection.style.display = "none";
    if (loginSection) loginSection.style.display = "flex";
  });
}



// متغيرات لتخزين معلومات المستخدم الذي ينتظر التفعيل
let pendingUserId    = null;
let pendingUsername  = null;
let pendingUserEmail = null;

/* ================== رسائل الواجهة ================== */

function showAuthMessage(type, text) {
  if (!authAlertBox) return;
  authAlertBox.style.display = "block";
  authAlertBox.textContent = text;
  authAlertBox.className = "auth-alert"; // reset
  if (type === "error") {
    authAlertBox.classList.add("auth-alert-error");
  } else if (type === "success") {
    authAlertBox.classList.add("auth-alert-success");
  }
}

function clearAuthMessage() {
  if (!authAlertBox) return;
  authAlertBox.style.display = "none";
  authAlertBox.textContent = "";
  authAlertBox.className = "auth-alert";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getRequestErrorMessage(err) {
  if (err.name === "AbortError") {
    return t("requestTimeout");
  }

  return t("requestError");
}
function translateServerMessage(message) {
  if (!message) return t("serverGenericError");

  const lower = String(message).toLowerCase();

  if (message.includes("الكود غير صحيح") || lower.includes("invalid code")) {
    return t("invalidCode");
  }

  if (message.includes("انتهت صلاحية") || lower.includes("expired")) {
    return t("expiredCode");
  }

  if (message.includes("المستخدم غير موجود") || lower.includes("user not found")) {
    return t("userNotFound");
  }

  if (message.includes("كلمة المرور") || lower.includes("password")) {
    return t("wrongPassword");
  }

  if (message.includes("خطأ في السيرفر") || message.includes("حدث خطأ")) {
    return t("serverGenericError");
  }
  if (message.includes("هذا المستخدم موجود بالفعل ضمن جهات اتصالك")) {
    return t("contactAlreadyExists");
  }

  if (message.includes("تم إرسال طلب صداقة لهذا المستخدم مسبقاً") || message.includes("تم إرسال طلب صداقة لهذا المستخدم مسبقًا")) {
    return t("friendRequestAlreadyPending");
  }

  return message;
}


/* ================== عدّاد إعادة الإرسال ================== */

function startVerifyTimer(seconds) {
  if (!verifyTimer || !verifyTimerValue || !btnResendCode) return;

  // إلغاء أي عدّاد قديم
  if (verifyTimerInterval) {
    clearInterval(verifyTimerInterval);
    verifyTimerInterval = null;
  }

  // إظهار العدّاد وإخفاء زر إعادة الإرسال
  if (seconds > 0) {
    verifyTimer.style.display   = "block";
    btnResendCode.style.display = "none";

    let remaining = seconds;
    verifyTimerValue.textContent = remaining;

    verifyTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(verifyTimerInterval);
        verifyTimerInterval = null;
        verifyTimer.style.display   = "none";
        btnResendCode.style.display = "block";
      } else {
        verifyTimerValue.textContent = remaining;
      }
    }, 1000);
  } else {
    // لو ما في عدّاد نسمح مباشرة بإعادة الإرسال
    verifyTimer.style.display   = "none";
    btnResendCode.style.display = "block";
  }
}

/* ================== تبويبات تسجيل الدخول / التسجيل ================== */

authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    authTabs.forEach(t => t.classList.remove("auth-tab-active"));
    tab.classList.add("auth-tab-active");

    authPanels.forEach(panel => {
      const panelName = panel.getAttribute("data-panel");
      if (panelName === target) {
        panel.classList.add("auth-panel-active");
      } else {
        panel.classList.remove("auth-panel-active");
      }
    });

    clearAuthMessage();
  });
});

/* ================== زر الرجوع لتعديل البيانات ================== */

if (btnBackToRegister) {
  btnBackToRegister.addEventListener("click", () => {
    // إخفاء صندوق التفعيل
    verifyBox.style.display = "none";

    // إظهار نموذج التسجيل/الدخول مرة أخرى
    if (authBody) {
      authBody.style.display = "block";
    }

    // إلغاء العدّاد لو شغال
    if (verifyTimerInterval) {
      clearInterval(verifyTimerInterval);
      verifyTimerInterval = null;
    }

    // إخفاء التايمر وزر إعادة الإرسال
    if (verifyTimer) {
      verifyTimer.style.display = "none";
    }
    if (btnResendCode) {
      btnResendCode.style.display = "none";
    }

    clearAuthMessage();
  });
}

/* ================== جلب المستخدمين (قائمة الشركاء) ================== */

async function loadUsers() {
  if (!currentUser) return;

  try {
    const res = await fetchWithTimeout(`/api/contacts/${encodeURIComponent(currentUser)}`);
    const data = await res.json();

    if (!contactsList) return;
    contactsList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      contactsList.innerHTML = `<p class="empty-requests">${t("noContacts")}</p>`;
      return;
    }

    data.forEach(u => {
      const item = document.createElement("div");
      item.className = "contact-item";
      item.dataset.username = u.Username;
      item.innerHTML = `
        <div class="contact-avatar">${(u.Username || "?").charAt(0).toUpperCase()}</div>
        <div class="contact-meta">
          <div class="contact-name">${u.Username}</div>
          <div class="contact-last"></div>
        </div>
      `;

      item.addEventListener("click", async () => {
        document.querySelectorAll(".contact-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        activePartner = u.Username;
        messagesDiv.textContent = t("loadingConversation");

        setChatHeader(u.Username);

        socket.emit("joinRoom", { user1: currentUser, user2: activePartner });
        await loadHistory(currentUser, activePartner);
        showChatForMobile();
        messageInput.focus();
      });

      contactsList.appendChild(item);
    });

    if (contactsSearch) {
      contactsSearch.addEventListener("input", () => {
        const q = contactsSearch.value.trim().toLowerCase();
        document.querySelectorAll(".contact-item").forEach(el => {
          const name = (el.dataset.username || "").toLowerCase();
          el.style.display = name.includes(q) ? "" : "none";
        });
      });
    }

  } catch (err) {
    console.error("Error loading contacts:", err);
  }
}

function isMobileView() {
  return window.matchMedia('(max-width:900px)').matches;
}

function setChatHeader(username) {
  if (!chatHeader || !chatHeaderName || !chatHeaderAvatar || !chatHeaderStatus) return;

  chatHeaderName.textContent = username || "";
  chatHeaderAvatar.textContent = (username && username.charAt(0))
    ? username.charAt(0).toUpperCase()
    : "?";

  chatHeaderStatus.textContent = t("chatOnline");
  chatHeader.style.display = "block";
}

function updateLayoutAfterLogin() {
  if (isMobileView()) {
    // show contacts only
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'none';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  } else {
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  }
}

function showChatForMobile() {
  if (isMobileView()) {
    if (contactsSection) contactsSection.style.display = 'none';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'inline-block';

    // push a history state so the device/back button can be used to close the chat
    try {
      if (!history.state || !history.state.chatOpen) {
        history.pushState({ chatOpen: true }, '');
      }
    } catch (e) {
      // ignore
    }
  }
}

if (btnBackToContacts) {
  btnBackToContacts.addEventListener('click', () => {
    // On mobile, prefer navigating history back so the hardware back button syncs
    if (isMobileView() && history.state && history.state.chatOpen) {
      history.back();
      return;
    }

    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'none';
    btnBackToContacts.style.display = 'none';
    // hide header when returning to contacts
    if (chatHeader) chatHeader.style.display = 'none';
    // clear active partner
    activePartner = null;
    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
  });
}

window.addEventListener('resize', () => {
  // adapt layout when resizing
  if (!currentUser) return;
  if (isMobileView()) {
    // mobile: if a partner is active show chat, else show contacts
    if (activePartner) {
      if (contactsSection) contactsSection.style.display = 'none';
      if (mainArea) mainArea.style.display = 'flex';
      if (btnBackToContacts) btnBackToContacts.style.display = 'inline-block';
    } else {
      if (contactsSection) contactsSection.style.display = 'flex';
      if (mainArea) mainArea.style.display = 'none';
      if (btnBackToContacts) btnBackToContacts.style.display = 'none';
    }
  } else {
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  }
});

// Handle browser/device back button on mobile: when popstate occurs close chat (if open)
window.addEventListener('popstate', (e) => {
  // only intervene on mobile
  if (!isMobileView()) return;

  // if chat was open and state no longer indicates chatOpen, close chat UI
  const state = e.state;
  if (!state || !state.chatOpen) {
    if (activePartner) {
      if (contactsSection) contactsSection.style.display = 'flex';
      if (mainArea) mainArea.style.display = 'none';
      if (btnBackToContacts) btnBackToContacts.style.display = 'none';
      if (chatHeader) chatHeader.style.display = 'none';
      document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
      activePartner = null;
    }
  }
});
/* ================== الرسائل / المحادثة ================== */
function clearEmptyChatPlaceholder() {
  const emptyPlaceholder = messagesDiv.querySelector(".empty-chat-placeholder");

  if (emptyPlaceholder) {
    emptyPlaceholder.remove();
  }
}

async function loadHistory(user1, user2) {
  try {
    const res = await fetchWithTimeout(
      `/api/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
    );
    const data = await res.json();

    messagesDiv.innerHTML = "";

    if (!data.length) {
      messagesDiv.innerHTML = `
        <p class="empty-chat-placeholder" style="text-align: center;">
          ${t("emptyChat")}
        </p>
      `;
      return;
    }

    data.forEach(m => {
      appendMessage(
        m.Username,
        m.Content,
        m.CreatedAt,
        m.MessageType || "text",
        {
          data: m.MediaData,
          name: m.MediaName,
          mime: m.MediaMime,
          size: m.MediaSize
        }
      );
    });
  } catch (err) {
    console.error("Error loading history:", err);
    messagesDiv.textContent = t("historyLoadError");
  }
}

function appendMessage(senderUsername, text, createdAt, messageType = "text", media = null) {
  clearEmptyChatPlaceholder();

  const div = document.createElement("div");
  div.classList.add("msg");

  const isSelf = (currentUser && senderUsername === currentUser);
  div.classList.add(isSelf ? "self" : "other");

  const content = document.createElement("div");

  if (messageType === "image" && media && media.data && media.mime) {
    const img = document.createElement("img");
    img.className = "chat-image";
    img.src = `data:${media.mime};base64,${media.data}`;
    img.alt = media.name || "image";
    img.title = t("openImageTitle");

    img.addEventListener("click", () => {
      openImageViewer(img.src, media.name || "image");
    });

    content.appendChild(img);
  



  } else if (messageType === "audio" && media && media.data && media.mime) {
    const audio = document.createElement("audio");
    audio.className = "chat-audio";
    audio.controls = true;
    audio.preload = "metadata";

    const cleanMime = media.mime.split(";")[0] || "audio/webm";

    const source = document.createElement("source");
    source.src = `data:${cleanMime};base64,${media.data}`;
    source.type = cleanMime;

    audio.appendChild(source);
    content.appendChild(audio);
  }

  else {
    content.textContent = text || "";
  }

  div.appendChild(content);

  const time = document.createElement("span");
  time.className = "time";
  const d = new Date(createdAt || Date.now());
  time.textContent = d.toLocaleTimeString();
  div.appendChild(time);

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function openImageViewer(src, altText) {
  const overlay = document.createElement("div");
  overlay.className = "image-viewer-overlay";

  overlay.innerHTML = `
    <button type="button" class="image-viewer-close">×</button>
    <img src="${src}" alt="${altText}">
  `;

  overlay.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("image-viewer-overlay") ||
      e.target.classList.contains("image-viewer-close")
    ) {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
}

/* ================== تسجيل الدخول ================== */

btnLogin.addEventListener("click", async () => {
  const login = loginIdentifierInput.value.trim();
  const password = loginPasswordInput.value;

  clearAuthMessage();

  if (!login || !password) {
    showAuthMessage("error", t("loginRequired"));
    return;
  }

  try {
    btnLogin.disabled = true;
    btnLogin.textContent = t("loginLoading");

    const res = await fetchWithTimeout("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", translateServerMessage(data.error) || t("loginFailed"));
      return;
    }

    currentUser = data.user.Username;

    loginSection.style.display = "none";
    chatSection.style.display = "block";

    await loadUsers();
    await loadPendingRequests();
    updateLayoutAfterLogin();

    loginPasswordInput.value = "";
    clearAuthMessage();
  } catch (err) {
    console.error("Error in login:", err);
    showAuthMessage("error", getRequestErrorMessage(err));
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = t("loginButton");
  }
});

/* ================== إنشاء حساب جديد ================== */

btnRegister.addEventListener("click", async () => {
  const username = regUsernameInput.value.trim();
  const email = regEmailInput.value.trim();
  const password = regPasswordInput.value;

  clearAuthMessage();

  if (!username) {
    showAuthMessage("error", t("registerUsernameRequired"));
    return;
  }

  if (!email) {
    showAuthMessage("error", t("registerEmailRequired"));
    return;
  }

  if (!password || password.length < 6) {
    showAuthMessage("error", t("registerPasswordMin"));
    return;
  }

  try {
    btnRegister.disabled = true;
    btnRegister.textContent = t("registerLoading");

    const res = await fetchWithTimeout("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", translateServerMessage(data.error) || t("registerFailed"));
      return;
    }

    pendingUserId = data.userId;
    pendingUsername = data.user.Username;
    pendingUserEmail = data.user.Email;

    showAuthMessage("success", t("registerSuccess"));

    verifyBox.style.display = "block";

    if (authBody) {
      authBody.style.display = "none";
    }

    loginIdentifierInput.value = pendingUserEmail;

    startVerifyTimer(60);

  } catch (err) {
    console.error("Error in register:", err);
    showAuthMessage("error", getRequestErrorMessage(err));
  } finally {
    btnRegister.disabled = false;
    btnRegister.textContent = t("registerButton");
  }
});

/* ================== تفعيل البريد الإلكتروني ================== */

btnVerifyCode.addEventListener("click", async () => {
  const code = verifyCodeInput.value.trim();

  clearAuthMessage();

  if (!pendingUserId) {
    showAuthMessage("error", t("verifyNoPendingAccount"));
    return;
  }

  if (!code) {
    showAuthMessage("error", t("verifyCodeRequired"));
    return;
  }

  try {
    btnVerifyCode.disabled = true;
    btnVerifyCode.textContent = t("verifyLoading");

    const res = await fetchWithTimeout("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: pendingUserId,
        code
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", translateServerMessage(data.error) || t("verifyFailed"));
      return;
    }

    showAuthMessage("success", t("verifySuccess"));

    currentUser = pendingUsername;

    loginSection.style.display = "none";
    chatSection.style.display = "block";

    verifyBox.style.display = "none";
    verifyCodeInput.value = "";

    if (verifyTimerInterval) {
      clearInterval(verifyTimerInterval);
      verifyTimerInterval = null;
    }

    if (verifyTimer) {
      verifyTimer.style.display = "none";
    }

    if (btnResendCode) {
      btnResendCode.style.display = "none";
    }

    await loadUsers();
    await loadPendingRequests();
    updateLayoutAfterLogin();

    pendingUserId = null;
    pendingUsername = null;
    pendingUserEmail = null;

    clearAuthMessage();
  } catch (err) {
    console.error("Error in verify email:", err);
    showAuthMessage("error", getRequestErrorMessage(err));
  } finally {
    btnVerifyCode.disabled = false;
    btnVerifyCode.textContent = t("verifyButton");
  }
});

/* ================== زر "إعادة إرسال الكود" ================== */

if (btnResendCode) {
  btnResendCode.addEventListener("click", async () => {
    clearAuthMessage();

    if (!pendingUserId) {
      showAuthMessage("error", t("resendNoPendingAccount"));
      return;
    }

    const username = regUsernameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;

    if (!username || !email || !password) {
      showAuthMessage("error", t("resendCheckData"));
      return;
    }

    try {
      btnResendCode.disabled = true;

      const res = await fetchWithTimeout("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showAuthMessage("error", translateServerMessage(data.error) || t("resendFailed"));
        return;
      }

      pendingUserId = data.userId;
      pendingUsername = data.user.Username;
      pendingUserEmail = data.user.Email;

      showAuthMessage("success", t("resendSuccess"));

      startVerifyTimer(60);

    } catch (err) {
      console.error("Error in resend code:", err);
      showAuthMessage("error", getRequestErrorMessage(err));
    } finally {
      btnResendCode.disabled = false;
    }
  });
}

/* ================== فتح محادثة ================== */

// فتح المحادثة يتم الآن بالنقر على عنصر من قائمة جهات الاتصال (`.contact-item`)

/* ================== استقبال الرسائل ================== */

socket.on("chatMessage", (msg) => {
  if (!currentUser || !activePartner) return;

  const pair1 = [msg.from, msg.to].sort().join("-");
  const pair2 = [currentUser, activePartner].sort().join("-");
  if (pair1 !== pair2) return;

  if ((msg.messageType === "image" || msg.messageType === "audio") && msg.from === currentUser) {
    removePendingUploadMessage();
  }
  appendMessage(
    msg.from,
    msg.text,
    msg.createdAt,
    msg.messageType || "text",
    {
      data: msg.mediaData,
      name: msg.mediaName,
      mime: msg.mediaMime,
      size: msg.mediaSize
    }
  );
});
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function validateImageFile(file) {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
  const maxSize = 2 * 1024 * 1024; // 1MB

  if (!allowedTypes.includes(file.type)) {
    return t("invalidImageType");
  }

  if (file.size > maxSize) {
    return t("imageTooLarge");
  }

  return null;
}

function updateSelectedMediaPreview() {
  if (!selectedMediaPreview || !mediaInput || !messageInput) return;

  const file = mediaInput.files && mediaInput.files[0];

  if (!file) {
    selectedMediaPreview.style.display = "none";
    selectedMediaPreview.innerHTML = "";

    messageInput.disabled = false;
    messageInput.value = "";
    messageInput.placeholder = t("messagePlaceholder");

    return;
  }

  const validationError = validateImageFile(file);

  selectedMediaPreview.style.display = "flex";

  messageInput.value = "";
  messageInput.disabled = true;
  messageInput.placeholder = t("imageSelectedPlaceholder");

  if (validationError) {
    selectedMediaPreview.classList.add("selected-media-error");
    selectedMediaPreview.innerHTML = `
      <span>${validationError}</span>
      <button type="button" class="remove-media-btn" id="btnRemoveSelectedMedia" title="${t("removeImageTitle")}">×</button>
    `;
  } else {
    selectedMediaPreview.classList.remove("selected-media-error");
    selectedMediaPreview.innerHTML = `
      <span class="selected-media-name">📎 ${file.name}</span>
      <button type="button" class="remove-media-btn" id="btnRemoveSelectedMedia" title="${t("removeImageTitle")}">×</button>
    `;
  }

  const removeBtn = document.getElementById("btnRemoveSelectedMedia");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      mediaInput.value = "";
      updateSelectedMediaPreview();
    });
  }
}

function getSupportedAudioMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4"
  ];

  for (const type of types) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

function updateVoicePreview() {
  if (!voicePreview || !messageInput) return;

  if (!selectedVoiceBlob) {
    voicePreview.style.display = "none";
    voicePreview.innerHTML = "";

    if (!mediaInput || !(mediaInput.files && mediaInput.files[0])) {
      messageInput.disabled = false;
      messageInput.placeholder = t("messagePlaceholder");
    }

    return;
  }

  voicePreview.style.display = "flex";
  voicePreview.innerHTML = `
    <span>🎙️ ${t("voiceReady")}</span>
    <button type="button" class="remove-voice-btn" id="btnRemoveVoice" title="${t("removeVoiceTitle")}">×</button>
  `;

  messageInput.value = "";
  messageInput.disabled = true;
  messageInput.placeholder = t("voiceReady");

  const removeBtn = document.getElementById("btnRemoveVoice");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      selectedVoiceBlob = null;
      selectedVoiceMime = "";
      updateVoicePreview();
    });
  }
}

async function startVoiceRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    alert(t("audioNotSupported"));
    return;
  }

  if (mediaInput && mediaInput.files && mediaInput.files[0]) {
    alert(t("removeImageTitle"));
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedAudioMimeType();

    voiceChunks = [];
    selectedVoiceBlob = null;
    selectedVoiceMime = "";

    mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        voiceChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      selectedVoiceMime = mediaRecorder.mimeType || mimeType || "audio/webm";
      selectedVoiceBlob = new Blob(voiceChunks, { type: selectedVoiceMime });

      stream.getTracks().forEach(track => track.stop());

      isRecordingVoice = false;

      if (btnVoiceRecord) {
        btnVoiceRecord.classList.remove("recording");
        btnVoiceRecord.textContent = "🎤";
        btnVoiceRecord.title = t("recordVoiceTitle");
      }

      updateVoicePreview();
    };

    mediaRecorder.start();
    isRecordingVoice = true;

    if (btnVoiceRecord) {
      btnVoiceRecord.classList.add("recording");
      btnVoiceRecord.textContent = "⏹";
      btnVoiceRecord.title = t("stopRecording");
    }

    if (voicePreview) {
      voicePreview.style.display = "flex";
      voicePreview.innerHTML = `<span>🔴 ${t("recordingVoice")}</span>`;
    }

    messageInput.value = "";
    messageInput.disabled = true;
    messageInput.placeholder = t("recordingVoice");

  } catch (err) {
    console.error("Microphone error:", err);
    alert(t("microphoneError"));
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && isRecordingVoice) {
    mediaRecorder.stop();
  }
}

function validateAudioBlob(blob) {
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (blob.size > maxSize) {
    return t("audioTooLarge");
  }

  return null;
}

function showPendingVoiceUploadMessage() {
  clearEmptyChatPlaceholder();

  const div = document.createElement("div");
  div.classList.add("msg", "self", "pending-upload-message");

  const content = document.createElement("div");
  content.textContent = t("uploadingVoice");

  div.appendChild(content);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  pendingUploadMessage = div;
}

if (btnVoiceRecord) {
  btnVoiceRecord.addEventListener("click", () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });
}
/* ================== إرسال رسالة ================== */

if (btnChooseMedia && mediaInput) {
  btnChooseMedia.addEventListener("click", () => {
    mediaInput.click();
  });
}
if (mediaInput) {
  mediaInput.addEventListener("change", updateSelectedMediaPreview);
}
function showPendingUploadMessage() {
  clearEmptyChatPlaceholder();

  const div = document.createElement("div");
  div.classList.add("msg", "self", "pending-upload-message");

  const content = document.createElement("div");
  content.textContent = t("uploadingImage");

  div.appendChild(content);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  pendingUploadMessage = div;
}

function removePendingUploadMessage() {
  if (pendingUploadMessage) {
    pendingUploadMessage.remove();
    pendingUploadMessage = null;
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  const file = mediaInput && mediaInput.files && mediaInput.files[0];
  const voiceBlob = selectedVoiceBlob;
  if (!text && !file && !voiceBlob) return;

  if (!currentUser || !activePartner) {
    alert(t("chooseChatFirst"));
    return;
  }
  if (voiceBlob) {
    const validationError = validateAudioBlob(voiceBlob);

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      showPendingVoiceUploadMessage();

      const base64 = await readFileAsBase64(voiceBlob);

      socket.emit("chatMessage", {
        from: currentUser,
        to: activePartner,
        messageType: "audio",
        media: {
          data: base64,
          name: "voice-message.webm",
          mime: (selectedVoiceMime || voiceBlob.type || "audio/webm").split(";")[0],
          size: voiceBlob.size
        }
      });

      selectedVoiceBlob = null;
      selectedVoiceMime = "";
      updateVoicePreview();
      messageInput.value = "";
      messageInput.focus();
      return;
    } catch (err) {
      console.error("Error sending voice message:", err);
      removePendingUploadMessage();
      alert(t("requestError"));
      return;
    }
  }

  if (file) {
    const validationError = validateImageFile(file);

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      showPendingUploadMessage();
      const base64 = await readFileAsBase64(file);

      socket.emit("chatMessage", {
        from: currentUser,
        to: activePartner,
        messageType: "image",
        media: {
          data: base64,
          name: file.name,
          mime: file.type,
          size: file.size
        }
      });

      mediaInput.value = "";
      messageInput.value = "";
      updateSelectedMediaPreview();
      messageInput.focus();
      return;
    } catch (err) {
      console.error("Error reading image:", err);
      alert(t("requestError"));
      return;
    }
  }

  socket.emit("chatMessage", {
    from: currentUser,
    to: activePartner,
    messageType: "text",
    text
  });

  messageInput.value = "";
  messageInput.focus();
});

/* ================== إدارة جهات الاتصال ================== */

// التبديل بين تبويبات جهات الاتصال
contactsTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    contactsTabs.forEach(t => t.classList.remove("contacts-tab-active"));
    tab.classList.add("contacts-tab-active");

    contactsPanels.forEach(panel => {
      const panelName = panel.getAttribute("data-panel");
      if (panelName === target) {
        panel.classList.add("contacts-panel-active");
      } else {
        panel.classList.remove("contacts-panel-active");
      }
    });

    // عند فتح تبويب طلبات الصداقة، قم بتحميل الطلبات
    if (target === "requests") {
      loadPendingRequests();
    }
  });
});

// إرسال طلب صداقة
if (btnSendContactRequest) {
  btnSendContactRequest.addEventListener("click", async () => {
    const username = newContactUsernameInput.value.trim();

    if (!username) {
      showContactMessage("error", t("contactUsernameRequired"));
      return;
    }

    if (!currentUser) {
      showContactMessage("error", t("loginBeforeContact"));
      return;
    }

    if (username.toLowerCase() === currentUser.toLowerCase()) {
      showContactMessage("error", t("cannotAddYourself"));
      return;
    }

    try {
      btnSendContactRequest.disabled = true;
      btnSendContactRequest.textContent = t("sending");

      const res = await fetchWithTimeout("/api/contacts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUsername: currentUser,
          username: username
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showContactMessage("error", translateServerMessage(data.error) || t("sendContactFailed"));
        return;
      }

      if (!data.success) {
        showContactMessage("error", translateServerMessage(data.error) || t("sendContactFailed"));
        return;
      }

      showContactMessage("success", t("contactRequestSent"));
      newContactUsernameInput.value = "";

      await loadUsers();

    } catch (err) {
      console.error("Error sending contact request:", err);
      showContactMessage("error", getRequestErrorMessage(err));
    } finally {
      btnSendContactRequest.disabled = false;
      btnSendContactRequest.textContent = t("sendContactRequestButton");
    }
  });
}

// عرض رسالة في نموذج إضافة جهة اتصال
function showContactMessage(type, text) {
  if (!contactRequestMessage) return;
  contactRequestMessage.style.display = "block";
  contactRequestMessage.textContent = text;
  contactRequestMessage.className = "contact-message";
  contactRequestMessage.classList.add(type);

  // إخفاء الرسالة بعد 5 ثوان
  setTimeout(() => {
    contactRequestMessage.style.display = "none";
  }, 5000);
}

function showPendingRequestMessage(type, text) {
  if (!pendingRequestsList) return;

  const msg = document.createElement("p");
  msg.className = type === "success" ? "contact-message success" : "contact-message error";
  msg.textContent = text;

  pendingRequestsList.prepend(msg);

  setTimeout(() => {
    msg.remove();
  }, 5000);
}
// جلب طلبات الصداقة الواردة
async function loadPendingRequests() {
  if (!currentUser) return;

  try {
    pendingRequestsList.innerHTML = `<p class="loading-text">${t("loadingRequests")}</p>`;

    const res = await fetchWithTimeout(`/api/contacts/requests/${encodeURIComponent(currentUser)}`);
    const data = await res.json();

    if (!res.ok) {
      pendingRequestsList.innerHTML = `<p class="error-text">${t("loadRequestsError")}</p>`;
      return;
    }

    if (data.length === 0) {
      pendingRequestsList.innerHTML = `<p class="empty-requests">${t("noIncomingRequests")}</p>`;
      return;
    }

    pendingRequestsList.innerHTML = "";

    data.forEach(request => {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.innerHTML = `
        <div class="request-item-info">
          <div class="request-item-username">${request.FromUser}</div>
        </div>
        <div class="request-item-actions">
          <button class="btn-accept" data-contact-id="${request.ContactId}">
            ${t("acceptButton")}
          </button>
          <button class="btn-reject" data-contact-id="${request.ContactId}">
            ${t("rejectButton")}
          </button>
        </div>
      `;

      const acceptBtn = requestItem.querySelector(".btn-accept");
      const rejectBtn = requestItem.querySelector(".btn-reject");

      acceptBtn.addEventListener("click", () => handleAcceptRequest(request.ContactId));
      rejectBtn.addEventListener("click", () => handleRejectRequest(request.ContactId));

      pendingRequestsList.appendChild(requestItem);
    });

  } catch (err) {
    console.error("Error loading pending requests:", err);
    pendingRequestsList.innerHTML = `<p class="error-text">${t("loadRequestsError")}</p>`;
  }
}

// قبول طلب صداقة
async function handleAcceptRequest(contactId) {
  try {
    const res = await fetchWithTimeout("/api/contacts/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showPendingRequestMessage("error", translateServerMessage(data.error) || t("acceptRequestFailed"));
      return;
    }

    await loadPendingRequests();
    await loadUsers();

    showPendingRequestMessage("success", t("acceptRequestSuccess"));

  } catch (err) {
    console.error("Error accepting request:", err);
    showPendingRequestMessage("error", getRequestErrorMessage(err));
  }
}

// رفض طلب صداقة
async function handleRejectRequest(contactId) {
  if (!confirm(t("confirmRejectRequest"))) {
    return;
  }

  try {
    const res = await fetchWithTimeout("/api/contacts/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showPendingRequestMessage("error", translateServerMessage(data.error) || t("rejectRequestFailed"));
      return;
    }

    await loadPendingRequests();

    showPendingRequestMessage("success", t("rejectRequestSuccess"));

  } catch (err) {
    console.error("Error rejecting request:", err);
    showPendingRequestMessage("error", getRequestErrorMessage(err));
  }
}

/* ================== تهيئة عند تحميل الصفحة ================== */

clearAuthMessage();
loadUsers();
showInitialScreen();

(function(){
  const root = document.documentElement;
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('message');
  const chatHeaderEl = document.getElementById('chatHeader');

  // Write the CSS variables: --vh (1% of visual viewport) and --keyboard-height
  function writeCssVars(vhPx, keyboardPx){
    root.style.setProperty('--vh', `${vhPx * 0.01}px`);
    root.style.setProperty('--keyboard-height', `${keyboardPx}px`);
  }

  // Compute viewport and keyboard sizes using visualViewport when available.
  function computeViewportMetrics(){
    if (window.visualViewport){
      const vv = window.visualViewport;
      // vv.height is the layout viewport height (visible area excluding certain UI)
      const visibleHeight = vv.height;
      // estimate keyboard height: difference between window.innerHeight and visualViewport.height
      const estimatedKeyboard = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      writeCssVars(visibleHeight, estimatedKeyboard);
    } else {
      // fallback for older browsers: use window.innerHeight and zero keyboard
      writeCssVars(window.innerHeight, 0);
    }
  }

  // Debounce helper to avoid thrashing during rapid viewport events
  let timer = null;
  function debouncedCompute(delay = 60){
    clearTimeout(timer);
    timer = setTimeout(computeViewportMetrics, delay);
  }

  // Keep values up to date on resize/orientation and visualViewport changes
  window.addEventListener('resize', debouncedCompute, { passive: true });
  window.addEventListener('orientationchange', debouncedCompute, { passive: true });
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', debouncedCompute);
    window.visualViewport.addEventListener('scroll', debouncedCompute);
  }

  // When the input gains focus: wait a bit (keyboard show), recompute, scroll messages
  if (inputEl){
    inputEl.addEventListener('focus', () => {
      // Delay helps on iOS where keyboard animation takes some time
      setTimeout(() => {
        computeViewportMetrics();
        // scroll to bottom so latest messages are visible above the input
        try { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; } catch(e){}
        // ensure header remains visible (header is fixed, but this helps some browsers)
        try { if (chatHeaderEl) chatHeaderEl.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch(e){}
      }, 260);
    });

    // On blur: recompute after keyboard hides
    inputEl.addEventListener('blur', () => { setTimeout(computeViewportMetrics, 120); });
  }

  // Initial compute
  computeViewportMetrics();

  // Expose helper for debugging or manual recalculation
  window.__aziziChatViewport = { computeViewportMetrics };
})();
