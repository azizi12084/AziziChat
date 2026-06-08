# AziziChat

AziziChat is a full-stack real-time chat application developed as a software engineering project.
The system allows users to register, verify their email, log in, add contacts, exchange text messages, send images, and record voice messages in real time.

## Live Demo

https://azizichat.onrender.com

## Repository

https://github.com/azizi12084/AziziChat

## Project Status

The project is currently active and deployed on Render.
The current version supports:

* User registration and login
* Email verification with a verification code
* Real-time private messaging
* Contact request system
* Text messages
* Image messages
* Voice message recording and playback
* Multilingual interface: English, Arabic, and Turkish
* RTL / LTR layout support
* PostgreSQL database storage
* Deployment on Render

The next planned phase is adding notifications for new messages.

## Features

### Authentication

* User registration with username, email, and password
* Secure password hashing using bcrypt
* Login using username or email
* Email verification before account activation
* Verification code resend system

### Contacts

* Add users by username
* Send friend/contact requests
* Accept or reject incoming requests
* View contact list
* Search contacts

### Real-Time Chat

* Real-time private messaging using Socket.IO
* Private rooms for conversations
* Message history loaded from the database
* Automatic chat updates without page refresh

### Media Messages

* Send images inside conversations
* Image preview before sending
* Image size validation
* Open sent images in a larger viewer
* Record and send voice messages
* Play voice messages directly inside the chat
* Media messages are stored in PostgreSQL for this academic/demo version

### Multilingual Interface

AziziChat supports three interface languages:

* English
* Arabic
* Turkish

The application also supports both:

* LTR layout for English and Turkish
* RTL layout for Arabic

### Responsive Design

The interface is designed to work on:

* Desktop browsers
* Mobile browsers
* Different screen sizes

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* PostgreSQL
* bcrypt
* Helmet
* dotenv

### Database

* PostgreSQL
* Neon PostgreSQL

### Deployment

* Render
* GitHub

## Database Tables

The main database tables are:

* `Users`
* `Rooms`
* `Contacts`
* `Messages`

The `Messages` table supports text and media messages using fields such as:

* `Content`
* `MessageType`
* `MediaData`
* `MediaName`
* `MediaMime`
* `MediaSize`

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/azizi12084/AziziChat.git
cd AziziChat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file in the project root and add the required environment variables.

Example:

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
SMTP_HOST=your_email_host
SMTP_PORT=your_email_port
SMTP_USER=your_email_user
SMTP_PASS=your_email_password
```

### 4. Run the database schema

```bash
node run_schema_pg.js
```

### 5. Start the server

```bash
npm start
```

or:

```bash
node server.js
```

The application will run on:

```text
http://localhost:3000
```

## Important Notes

For this academic version, media files are stored in PostgreSQL as Base64 data.
This approach is simple and useful for demonstration purposes.

For a production-level system, it would be better to store media files in a dedicated storage service such as:

* AWS S3
* Cloudinary
* Firebase Storage
* Supabase Storage

Then only the media URL should be stored in the database.

## Completed Development Phases

### Phase 1: Chat Placeholder Fix

Fixed the issue where the empty chat message stayed visible after sending the first message.

### Phase 2: Multilingual Support

Added English, Arabic, and Turkish language support with RTL/LTR layout handling.

### Phase 3: Image Messages

Added image sending, image preview, validation, storage, and display in chat history.

### Phase 3.5: Image UX Improvements

Improved the image selection interface, added upload feedback, disabled text input when an image is selected, and added image viewer support.

### Phase 3.6: Voice Messages

Added voice recording, sending, storage, and playback inside the chat.

## Next Planned Features

* In-app notifications
* Unread message counters
* Browser notifications
* Better media compression
* Message read status
* User profile pictures
* Online/offline status improvements

## What I Learned

During this project, I practiced and improved my knowledge in:

* Full-stack web development
* Real-time communication using Socket.IO
* PostgreSQL database design
* Authentication and email verification
* Secure password hashing
* Media handling in web applications
* Responsive UI design
* Multilingual interfaces
* Deployment using Render
* Git and GitHub workflow

## Author

Muhammed Azizi
Software Engineering Student
GitHub: https://github.com/azizi12084
