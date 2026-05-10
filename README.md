# Sahayogi

**Sahayogi** (Nepali for "helper") is a community-driven platform that connects donors and recipients to facilitate resource sharing and mutual aid. People can post what they need or what they can offer, browse community requests, react and comment on posts, and message each other directly.

---

## Features

- **Post needs or offers** across categories: money, clothes, food, furniture, utensils, books, medical supplies, and more
- **Browse and filter** community posts by category and intent (offer or request)
- **Community Needs** section curated by admins for urgent causes
- **Reactions and comments** on posts (heart, care, sad)
- **Direct messaging** between users with real-time delivery
- **Real-time notifications** via Socket.io for messages, post approvals, and system events
- **Admin panel** for post moderation (approve/reject), user management, and dashboard statistics
- **Anonymous posting** option for privacy
- **Role-based access control**: donor, recipient, and admin roles
- **Post lifecycle tracking**: pending, available, claimed, completed

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| TanStack React Query | Data fetching and caching |
| Socket.io-client | Real-time communication |
| Tailwind CSS + Radix UI | Styling and accessible components |
| React Hook Form + Zod | Form management and validation |
| Sonner | Toast notifications |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express 5 | HTTP server |
| Prisma 6 | ORM and database migrations |
| PostgreSQL | Primary database |
| Socket.io | Real-time events |
| JWT + bcryptjs | Authentication and password hashing |

---

## Project Structure

```
SYP/
├── backend/                  # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Prisma migration history
│   │   └── seed.js           # Database seeder
│   ├── routes/               # API route handlers
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   ├── messages.routes.js
│   │   ├── notifications.routes.js
│   │   ├── users.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── admin.middleware.js
│   ├── services/
│   │   └── notification.service.js
│   ├── index.js              # Entry point
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── Sahayogi/                 # React + TypeScript frontend
    ├── src/
    │   ├── pages/            # Route-level page components
    │   ├── components/       # Shared UI components
    │   │   ├── ui/           # Radix-based primitives
    │   │   └── guards/       # Auth and role guards
    │   ├── contexts/         # React contexts (Auth, Socket)
    │   ├── assets/           # Static images
    │   └── App.tsx           # Route tree
    └── public/               # Public static files
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/devashmit/SYP.git
cd SYP
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sahayogi?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
```

Run database migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 3. Set up the frontend

```bash
cd Sahayogi
npm install
```

Create a `.env` file in the `Sahayogi/` directory:

```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Docker (Backend + Database)

You can run the backend and PostgreSQL together using Docker Compose:

```bash
cd backend
docker-compose up
```

This starts:
- The Node.js API on port `3000`
- PostgreSQL 15 on port `5432`

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/posts` | List posts (filterable) |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts/:id` | Get post details |
| POST | `/api/posts/:id/comments` | Add a comment |
| POST | `/api/posts/:id/reactions` | React to a post |
| POST | `/api/posts/:id/share` | Share post via message |
| GET | `/api/messages/conversations` | List conversations |
| GET | `/api/messages/:userId` | Get message thread |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/admin/posts` | Admin: list all posts |
| POST | `/api/admin/posts/:id/approve` | Admin: approve post |
| POST | `/api/admin/posts/:id/reject` | Admin: reject post |
| GET | `/api/admin/stats` | Admin: dashboard stats |

---

## Database Schema

Key models:

- **Profile** - User accounts with roles: `donor`, `recipient`, `admin`
- **Post** - Help requests or offers with status lifecycle: `pending > available > claimed > completed`
- **Category** - Post categories (food, clothes, money, etc.)
- **Comment** - Comments on posts
- **Message** - Direct messages between users
- **Reaction** - Post reactions (heart, care, sad), one per user per post
- **Notification** - In-app notifications with deduplication

---

## Real-Time Events

Socket.io is used for:

- Live post updates (created, updated, deleted)
- Real-time reactions and comments
- Instant message delivery
- Push notifications to connected users
- Admin broadcasts via a dedicated admin room

Authentication is required for socket connections via JWT in the handshake.

---

## Author

Built by [Devashmit](https://github.com/devashmit).

---

## License

This project is for educational and community use.
