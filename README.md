# AziziChat

AziziChat is a full-stack real-time chat application built with HTML, CSS, JavaScript, Node.js, Express.js, Socket.IO, and PostgreSQL.

The application allows users to register, verify their email, log in, manage contacts, send friend requests, and exchange real-time private messages.

---

## 🌐 Live Demo

The project is deployed on Render:

https://azizichat.onrender.com

---

## 🚀 Features

- User registration and login
- Email verification system
- Secure password hashing with bcrypt
- Contact list management
- Send, accept, and reject friend requests
- Private chat rooms between users
- Real-time messaging using Socket.IO
- Message storage in PostgreSQL
- Last login tracking
- Responsive web interface
- Live deployment on Render

---

## 🛠️ Tech Stack

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- Socket.IO

### Database

- PostgreSQL
- Neon PostgreSQL

### Security

- bcrypt
- Helmet
- dotenv

### Email

- Resend API

### Deployment and Tools

- Render
- Git
- GitHub
- VS Code

---

## 📁 Project Structure

```text
AziziChat/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── db/
│   ├── users.js
│   ├── contacts.js
│   ├── rooms.js
│   └── messages.js
│
├── db_pg.js
├── server.js
├── schema_pg.sql
├── run_schema_pg.js
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 🗄️ Database Structure

The project uses PostgreSQL as the main database.

Main tables:

- Users
- Contacts
- Rooms
- Messages

Database operations are organized inside the `db/` folder:

- `users.js` → user queries
- `contacts.js` → contact and friend request queries
- `rooms.js` → private chat room queries
- `messages.js` → message queries

This structure keeps database code separate from `server.js`.

---

## 📸 Screenshots

### Login Page

![Login Page](login.png)

### Register Page

![Register Page](register.png)

---

## ⚙️ How to Run Locally

Clone the project:

```bash
git clone https://github.com/azizi12084/AziziChat.git
cd AziziChat
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root.

Then run the project:

```bash
npm start
```

Or:

```bash
node server.js
```

Open the app in the browser:

```text
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file and add the required values:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_sender_email

NODE_ENV=development
PORT=3000
```

The `.env` file is not uploaded to GitHub for security reasons.

---

## 📊 Project Status

The project is currently working and deployed on Render.

Current completed parts:

- User registration
- Email verification
- User login
- Contact management
- Friend requests
- Private chat rooms
- Real-time messaging
- PostgreSQL database storage
- Render deployment

---

## 💡 What I Learned

In this project, I practiced:

- HTML, CSS, and JavaScript
- Responsive web design
- DOM manipulation
- REST API usage
- Node.js and Express.js
- Socket.IO real-time communication
- PostgreSQL database integration
- Password hashing with bcrypt
- Git and GitHub workflow
- Render deployment
- Backend code organization

---

## 👤 Developer

**Muhammed Azizi**

GitHub: https://github.com/azizi12084