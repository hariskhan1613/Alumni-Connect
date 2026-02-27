# Alumni Connect - LPU Alumni Networking Platform

A production-ready, fully scalable Alumni Connect Web Application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). This platform connects LPU students and alumni for networking, job referrals, and community engagement.

## ✨ Features

### Authentication & Authorization
- JWT-based register/login/logout
- Role-based access control (Student, Alumni, Admin)
- Password hashing with bcrypt
- Forgot password with email reset

### User Profiles
- Full profile with picture, cover image, bio, skills, course, batch, company, job role, LinkedIn, resume, location
- Edit profile with inline form
- Cloudinary image uploads

### News Feed
- Create, edit, delete posts with image support
- Like/unlike posts
- Comment on posts with real-time updates

### Alumni Directory
- Browse all alumni with pagination
- Search by name
- Filter by company, batch, skills, job role

### Connection System
- Send/accept/reject connection requests
- View connections list
- Connection status indicators

### Real-Time Chat
- One-to-one messaging via Socket.io
- Conversation sidebar with unread counts
- Online status indicators
- Typing indicators

### Jobs & Referrals
- Alumni post jobs/internships/referrals
- Students browse and apply
- Filter by type

### Notifications
- Connection request/accepted notifications
- New job posted notifications
- Real-time notification delivery
- Mark as read/mark all read

### Admin Dashboard
- Platform stats overview
- Manage users (view/delete)
- Manage posts (view/delete)
- Manage jobs (view/delete)

### UI/UX
- Dark/Light mode toggle
- Glassmorphism design
- Smooth animations with Framer Motion
- Fully responsive (mobile/tablet/desktop)

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TailwindCSS v4, Redux Toolkit, React Router DOM, Framer Motion, Axios, Socket.io Client |
| Backend | Node.js, Express.js, Mongoose, JWT, bcrypt, Socket.io, Multer |
| Database | MongoDB Atlas |
| Cloud | Cloudinary (images), Nodemailer (emails) |

## 📁 Project Structure

```
├── server/
│   ├── config/          # DB, Cloudinary, Email config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, role middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── socket.js        # Socket.io setup
│   └── server.js        # Entry point
├── client/
│   └── src/
│       ├── components/  # Layout, reusable components
│       ├── pages/       # All page components
│       ├── store/       # Redux store & slices
│       └── services/    # API & Socket services
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
# Install server dependencies
cd server
cp .env.example .env   # Edit with your credentials
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env` with your credentials:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📡 API Endpoints

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/register`, `login`, `logout`, `forgot-password` |
| Users | `GET /api/users/profile/:id`, `PUT /profile`, `GET /search`, `GET /directory` |
| Posts | `POST /api/posts`, `GET /`, `PUT /:id`, `DELETE /:id`, `PUT /:id/like`, `POST /:id/comment` |
| Connections | `POST /api/connections/request/:id`, `PUT /accept/:id`, `PUT /reject/:id`, `GET /`, `GET /pending` |
| Messages | `POST /api/messages/send`, `GET /:userId`, `GET /conversations` |
| Jobs | `POST /api/jobs`, `GET /`, `POST /:id/apply`, `DELETE /:id` |
| Notifications | `GET /api/notifications`, `PUT /:id/read`, `PUT /read-all` |
| Admin | `GET /api/admin/stats`, `users`, `posts`, `jobs` + DELETE endpoints |

## 📄 License

MIT
