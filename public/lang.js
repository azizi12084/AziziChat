const LANGUAGES = {
  ar: {
    appSubtitle: "سجل الدخول أو أنشئ حسابًا جديدًا للبدء في الدردشة",
    loginTab: "تسجيل الدخول",
    registerTab: "إنشاء حساب",
    loginIdentifierLabel: "البريد الإلكتروني أو اسم المستخدم:",
    loginIdentifierPlaceholder: "اكتب بريدك الإلكتروني أو اسم المستخدم",
    loginPasswordLabel: "كلمة المرور:",
    loginPasswordPlaceholder: "اكتب كلمة المرور",
    loginButton: "تسجيل الدخول",

    registerUsernameLabel: "اسم المستخدم:",
    registerUsernamePlaceholder: "اختر اسم المستخدم",
    registerEmailLabel: "البريد الإلكتروني:",
    registerEmailPlaceholder: "example@mail.com",
    registerPasswordLabel: "كلمة المرور:",
    registerPasswordPlaceholder: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    registerButton: "إنشاء الحساب",

    contactsTab: "جهات الاتصال",
    addContactTab: "إضافة جهة اتصال",
    requestsTab: "طلبات الصداقة",
    contactsSearchPlaceholder: "ابحث في جهات الاتصال",
    noContacts: "لا توجد جهات اتصال بعد",
    addContactTitle: "إضافة جهة اتصال جديدة",
    newContactUsernameLabel: "اسم المستخدم:",
    newContactUsernamePlaceholder: "أدخل اسم المستخدم",
    sendContactRequestButton: "إرسال طلب صداقة",
    pendingRequestsTitle: "طلبات الصداقة الواردة",
    loading: "جاري التحميل...",

    chatOnline: "متصل",
    noChatSelected: "لم يتم اختيار أي محادثة بعد. اختر جهة اتصال للبدء.",
    emptyChat: "لا توجد رسائل بعد، ابدأ المحادثة 😊",
    messagePlaceholder: "اكتب رسالتك...",
    sendButton: "إرسال",

    requestTimeout: "الطلب استغرق وقتًا طويلًا. تحقق من الاتصال وحاول مرة أخرى.",
    requestError: "خطأ في الاتصال بالسيرفر. حاول مرة أخرى.",

    languageTitle: "اختر لغة للبدء",
    languageSubtitle: "اختر لغة الواجهة للمتابعة",
    startButton: "ابدأ",

    verifyTitle: "تفعيل البريد الإلكتروني",
    verifyText: "أدخل كود التحقق المرسل إلى بريدك الإلكتروني.",
    verifyCodeLabel: "كود التحقق:",
    verifyCodePlaceholder: "أدخل الكود",
    verifyButton: "تأكيد",
    resendCodeButton: "إعادة إرسال الكود",
    backToRegister: "رجوع",
    resendTimerPrefix: "يمكنك طلب كود جديد بعد",
    secondsWord: "ثانية",

    authFooterText: "جميع الحقوق محفوظة © AziziChat",
    loginRequired: "الرجاء إدخال اسم المستخدم أو البريد وكلمة المرور.",
loginLoading: "الرجاء الانتظار...",
loginFailed: "فشل تسجيل الدخول",

registerUsernameRequired: "الرجاء إدخال اسم المستخدم.",
registerEmailRequired: "الرجاء إدخال البريد الإلكتروني.",
registerPasswordMin: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
registerLoading: "جاري إنشاء الحساب...",
registerFailed: "فشل إنشاء الحساب",
registerSuccess: "تم إنشاء الحساب، وتم إرسال كود التفعيل إلى بريدك.",

verifyNoPendingAccount: "لا يوجد حساب قيد التفعيل.",
verifyCodeRequired: "الرجاء إدخال كود التفعيل.",
verifyLoading: "جاري التفعيل...",
verifyFailed: "فشل تفعيل البريد الإلكتروني",
verifySuccess: "تم تفعيل البريد الإلكتروني بنجاح.",

resendNoPendingAccount: "لا يوجد حساب قيد التفعيل.",
resendCheckData: "تأكد من عدم تعديل بيانات الحساب.",
resendFailed: "لا يمكن إعادة إرسال الكود.",
resendSuccess: "تم إرسال كود تفعيل جديد.",

loadingConversation: "يتم تحميل المحادثة...",
historyLoadError: "خطأ في تحميل الرسائل.",
chooseChatFirst: "اختر أولاً الشخص الذي تريد محادثته.",

contactUsernameRequired: "الرجاء إدخال اسم المستخدم.",
loginBeforeContact: "يجب تسجيل الدخول أولاً.",
cannotAddYourself: "لا يمكنك إضافة نفسك.",
sending: "جاري الإرسال...",
sendContactFailed: "فشل إرسال طلب الصداقة.",
contactRequestSent: "تم إرسال طلب الصداقة.",

loadingRequests: "جاري التحميل...",
loadRequestsError: "خطأ في تحميل طلبات الصداقة.",
noIncomingRequests: "لا توجد طلبات صداقة واردة.",
acceptButton: "قبول",
rejectButton: "رفض",
acceptRequestFailed: "فشل قبول طلب الصداقة.",
acceptRequestSuccess: "تم قبول طلب الصداقة.",
confirmRejectRequest: "هل أنت متأكد من رفض طلب الصداقة؟",
rejectRequestFailed: "فشل رفض طلب الصداقة.",
rejectRequestSuccess: "تم رفض طلب الصداقة.",

invalidCode: "الكود غير صحيح",
expiredCode: "انتهت صلاحية كود التفعيل.",
userNotFound: "المستخدم غير موجود.",
wrongPassword: "كلمة المرور غير صحيحة.",
serverGenericError: "حدث خطأ، حاول مرة أخرى.",
contactAlreadyExists: "هذا المستخدم موجود بالفعل ضمن جهات اتصالك.",
friendRequestAlreadyPending: "تم إرسال طلب صداقة لهذا المستخدم مسبقًا وهو قيد الانتظار.",
chooseImageTitle: "اختر صورة",
imageTooLarge: "يجب أن يكون حجم الصورة 2MB أو أقل.",
invalidImageType: "الرجاء اختيار ملف صورة صالح.",
selectedImagePrefix: "تم اختيار:",
removeImageTitle: "إزالة الصورة"
  },

  tr: {
    appSubtitle: "Sohbete başlamak için giriş yapın veya yeni bir hesap oluşturun",
    loginTab: "Giriş Yap",
    registerTab: "Hesap Oluştur",
    loginIdentifierLabel: "E-posta veya kullanıcı adı:",
    loginIdentifierPlaceholder: "E-posta adresinizi veya kullanıcı adınızı yazın",
    loginPasswordLabel: "Şifre:",
    loginPasswordPlaceholder: "Şifrenizi yazın",
    loginButton: "Giriş Yap",

    registerUsernameLabel: "Kullanıcı adı:",
    registerUsernamePlaceholder: "Kullanıcı adı seçin",
    registerEmailLabel: "E-posta:",
    registerEmailPlaceholder: "example@mail.com",
    registerPasswordLabel: "Şifre:",
    registerPasswordPlaceholder: "Şifre en az 6 karakter olmalıdır",
    registerButton: "Hesap Oluştur",

    contactsTab: "Kişiler",
    addContactTab: "Kişi Ekle",
    requestsTab: "Arkadaşlık İstekleri",
    contactsSearchPlaceholder: "Kişilerde ara",
    noContacts: "Henüz kişi yok",
    addContactTitle: "Yeni Kişi Ekle",
    newContactUsernameLabel: "Kullanıcı adı:",
    newContactUsernamePlaceholder: "Kullanıcı adını girin",
    sendContactRequestButton: "Arkadaşlık İsteği Gönder",
    pendingRequestsTitle: "Gelen Arkadaşlık İstekleri",
    loading: "Yükleniyor...",

    chatOnline: "Çevrimiçi",
    noChatSelected: "Henüz bir sohbet seçilmedi. Başlamak için bir kişi seçin.",
    emptyChat: "Henüz mesaj yok, sohbeti başlatın 😊",
    messagePlaceholder: "Mesajınızı yazın...",
    sendButton: "Gönder",

    requestTimeout: "İstek çok uzun sürdü. Bağlantınızı kontrol edip tekrar deneyin.",
    requestError: "Sunucu bağlantısında hata oluştu. Lütfen tekrar deneyin.",

    languageTitle: "Başlamak için dil seçin",
    languageSubtitle: "Devam etmek için arayüz dilini seçin",
    startButton: "Başla",

    verifyTitle: "E-posta Doğrulama",
    verifyText: "E-postanıza gönderilen doğrulama kodunu girin.",
    verifyCodeLabel: "Doğrulama kodu:",
    verifyCodePlaceholder: "Kodu girin",
    verifyButton: "Onayla",
    resendCodeButton: "Kodu Tekrar Gönder",
    backToRegister: "Geri",
    resendTimerPrefix: "Yeni kod istemek için bekleyin:",
    secondsWord: "saniye",

    authFooterText: "Tüm hakları saklıdır © AziziChat",
    loginRequired: "Lütfen kullanıcı adı/e-posta ve şifre girin.",
loginLoading: "Lütfen bekleyin...",
loginFailed: "Giriş başarısız",

registerUsernameRequired: "Lütfen kullanıcı adı girin.",
registerEmailRequired: "Lütfen e-posta adresi girin.",
registerPasswordMin: "Şifre en az 6 karakter olmalıdır.",
registerLoading: "Hesap oluşturuluyor...",
registerFailed: "Hesap oluşturma başarısız",
registerSuccess: "Hesap oluşturuldu. Doğrulama kodu e-postanıza gönderildi.",

verifyNoPendingAccount: "Doğrulama bekleyen hesap yok.",
verifyCodeRequired: "Lütfen doğrulama kodunu girin.",
verifyLoading: "Doğrulanıyor...",
verifyFailed: "E-posta doğrulama başarısız",
verifySuccess: "E-posta başarıyla doğrulandı.",

resendNoPendingAccount: "Doğrulama bekleyen hesap yok.",
resendCheckData: "Lütfen hesap bilgilerinin değişmediğinden emin olun.",
resendFailed: "Doğrulama kodu tekrar gönderilemedi.",
resendSuccess: "Yeni doğrulama kodu gönderildi.",

loadingConversation: "Sohbet yükleniyor...",
historyLoadError: "Mesajlar yüklenirken hata oluştu.",
chooseChatFirst: "Lütfen önce bir kişi seçin.",

contactUsernameRequired: "Lütfen kullanıcı adı girin.",
loginBeforeContact: "Önce giriş yapmalısınız.",
cannotAddYourself: "Kendinizi ekleyemezsiniz.",
sending: "Gönderiliyor...",
sendContactFailed: "Arkadaşlık isteği gönderilemedi.",
contactRequestSent: "Arkadaşlık isteği gönderildi.",

loadingRequests: "Yükleniyor...",
loadRequestsError: "Arkadaşlık istekleri yüklenirken hata oluştu.",
noIncomingRequests: "Gelen arkadaşlık isteği yok.",
acceptButton: "Kabul Et",
rejectButton: "Reddet",
acceptRequestFailed: "Arkadaşlık isteği kabul edilemedi.",
acceptRequestSuccess: "Arkadaşlık isteği kabul edildi.",
confirmRejectRequest: "Bu arkadaşlık isteğini reddetmek istediğinizden emin misiniz?",
rejectRequestFailed: "Arkadaşlık isteği reddedilemedi.",
rejectRequestSuccess: "Arkadaşlık isteği reddedildi.",

invalidCode: "Doğrulama kodu yanlış",
expiredCode: "Doğrulama kodunun süresi doldu.",
userNotFound: "Kullanıcı bulunamadı.",
wrongPassword: "Şifre yanlış.",
serverGenericError: "Bir hata oluştu. Lütfen tekrar deneyin.",
contactAlreadyExists: "Bu kullanıcı zaten kişilerinizde mevcut.",
friendRequestAlreadyPending: "Bu kullanıcıya daha önce arkadaşlık isteği gönderildi ve hâlâ beklemede.",
chooseImageTitle: "Resim seç",
imageTooLarge: "Resim boyutu 2MB veya daha az olmalıdır.",
invalidImageType: "Lütfen geçerli bir resim dosyası seçin.",
selectedImagePrefix: "Seçildi:",
removeImageTitle: "Resmi kaldır"
  },

  en: {
    appSubtitle: "Log in or create a new account to start chatting",
    loginTab: "Login",
    registerTab: "Create Account",
    loginIdentifierLabel: "Email or username:",
    loginIdentifierPlaceholder: "Enter your email or username",
    loginPasswordLabel: "Password:",
    loginPasswordPlaceholder: "Enter your password",
    loginButton: "Login",

    registerUsernameLabel: "Username:",
    registerUsernamePlaceholder: "Choose a username",
    registerEmailLabel: "Email:",
    registerEmailPlaceholder: "example@mail.com",
    registerPasswordLabel: "Password:",
    registerPasswordPlaceholder: "Password must be at least 6 characters",
    registerButton: "Create Account",

    contactsTab: "Contacts",
    addContactTab: "Add Contact",
    requestsTab: "Friend Requests",
    contactsSearchPlaceholder: "Search contacts",
    noContacts: "No contacts yet",
    addContactTitle: "Add New Contact",
    newContactUsernameLabel: "Username:",
    newContactUsernamePlaceholder: "Enter username",
    sendContactRequestButton: "Send Friend Request",
    pendingRequestsTitle: "Incoming Friend Requests",
    loading: "Loading...",

    chatOnline: "Online",
    noChatSelected: "No chat selected yet. Choose a contact to start.",
    emptyChat: "No messages yet, start the conversation 😊",
    messagePlaceholder: "Type your message...",
    sendButton: "Send",

    requestTimeout: "The request took too long. Check your connection and try again.",
    requestError: "Server connection error. Please try again.",

    languageTitle: "Choose a language",
    languageSubtitle: "Select your preferred language to continue",
    startButton: "Start",

    verifyTitle: "Email Verification",
    verifyText: "Enter the verification code sent to your email.",
    verifyCodeLabel: "Verification code:",
    verifyCodePlaceholder: "Enter the code",
    verifyButton: "Verify",
    resendCodeButton: "Resend Code",
    backToRegister: "Back",
    resendTimerPrefix: "You can request a new code after",
    secondsWord: "seconds",

    authFooterText: "All rights reserved © AziziChat",
    loginRequired: "Please enter username/email and password.",
loginLoading: "Please wait...",
loginFailed: "Login failed",

registerUsernameRequired: "Please enter a username.",
registerEmailRequired: "Please enter an email address.",
registerPasswordMin: "Password must be at least 6 characters.",
registerLoading: "Creating account...",
registerFailed: "Account creation failed",
registerSuccess: "Account created. Verification code sent to your email.",

verifyNoPendingAccount: "No account is waiting for verification.",
verifyCodeRequired: "Please enter the verification code.",
verifyLoading: "Verifying...",
verifyFailed: "Email verification failed",
verifySuccess: "Email verified successfully.",

resendNoPendingAccount: "No account is waiting for verification.",
resendCheckData: "Please make sure the account information was not changed.",
resendFailed: "Could not resend verification code.",
resendSuccess: "A new verification code has been sent.",

loadingConversation: "Loading conversation...",
historyLoadError: "Error loading messages.",
chooseChatFirst: "Please choose a contact first.",

contactUsernameRequired: "Please enter a username.",
loginBeforeContact: "You must log in first.",
cannotAddYourself: "You cannot add yourself.",
sending: "Sending...",
sendContactFailed: "Failed to send friend request.",
contactRequestSent: "Friend request sent.",

loadingRequests: "Loading...",
loadRequestsError: "Error loading friend requests.",
noIncomingRequests: "No incoming friend requests.",
acceptButton: "Accept",
rejectButton: "Reject",
acceptRequestFailed: "Failed to accept friend request.",
acceptRequestSuccess: "Friend request accepted.",
confirmRejectRequest: "Are you sure you want to reject this friend request?",
rejectRequestFailed: "Failed to reject friend request.",
rejectRequestSuccess: "Friend request rejected.",

invalidCode: "Invalid verification code",
expiredCode: "Verification code has expired.",
userNotFound: "User not found.",
wrongPassword: "Incorrect password.",
serverGenericError: "Something went wrong. Please try again.",
contactAlreadyExists: "This user is already in your contacts.",
friendRequestAlreadyPending: "A friend request has already been sent to this user and is still pending.",
chooseImageTitle: "Choose image",
imageTooLarge: "Image size must be 2MB or less.",
invalidImageType: "Please choose a valid image file.",
selectedImagePrefix: "Selected:",
removeImageTitle: "Remove image"
  }
};

let currentPageLanguage = localStorage.getItem("azizichat_lang") || "en";

function getSavedLanguage() {
  return localStorage.getItem("azizichat_lang");
}

function getCurrentLanguage() {
  return currentPageLanguage || "en";
}

function setCurrentLanguage(lang) {
  currentPageLanguage = lang;
  localStorage.setItem("azizichat_lang", lang);
}

function t(key, langOverride) {
  const lang = langOverride || getCurrentLanguage();
  return (LANGUAGES[lang] && LANGUAGES[lang][key]) || LANGUAGES.en[key] || key;
}