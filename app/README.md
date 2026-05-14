# Instagram Clone

A production-ready, full-stack Instagram clone built with modern web technologies. Features a complete social media platform with posts, stories, reels, real-time messaging, notifications, and an admin dashboard.

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS + shadcn/ui
- React Router v7
- Socket.IO Client
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary (file uploads)
- Nodemailer (email)

## Features

- **Authentication:** Register, login, logout, JWT tokens, forgot/reset password, email verification
- **Posts:** Create, edit, delete, like, save, share, comments with nested replies, hashtags, mentions, carousel, location tagging
- **Stories:** Upload images/videos with text, 24h auto-expiry, progress bar viewer, reactions, highlights
- **Reels:** Vertical video feed, autoplay, swipe navigation, like/comment/share, mute/unmute
- **Messaging:** Real-time chat with Socket.IO, typing indicators, seen receipts, media sharing, group chats
- **Notifications:** Real-time notifications for likes, comments, follows, mentions, messages
- **Search:** Search users, hashtags, posts; explore page with trending content
- **Profile:** Customizable bio, avatar, cover image, followers/following, saved posts, private accounts
- **Settings:** Dark/light mode, privacy settings, change password, block/mute users
- **Admin Panel:** Dashboard analytics, user management, content moderation, reports handling
- **PWA Support:** Installable app, offline-ready, responsive on all devices

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image/video uploads)
- SMTP credentials (for email features)

### 1. Clone & Install

```bash
git clone <repo-url>
cd instagram-clone
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/instagram-clone

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 3000) concurrently.

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Set build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

### Backend (Railway/Render)
1. Push to GitHub
2. Create new service on Railway or Render
3. Set start command: `npm start`
4. Add all environment variables
5. Connect MongoDB Atlas

## Project Structure

```
/
├── public/               # Static assets, PWA manifest
├── server/               # Express backend
│   ├── config/           # Database, Cloudinary config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, upload, rate limiting
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── socket/           # Socket.IO setup
│   ├── utils/            # Email helper
│   └── index.js          # Server entry point
├── src/                  # React frontend
│   ├── components/       # Reusable components
│   ├── context/          # Auth, Theme, Socket contexts
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── .env.example          # Environment template
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/cover` - Update cover image
- `GET /api/users/suggested` - Get suggested users
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following
- `PUT /api/users/preferences` - Update preferences

### Posts
- `GET /api/posts/feed` - Get feed (paginated)
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike
- `POST /api/posts/:id/save` - Save/unsave
- `GET /api/posts/saved` - Get saved posts
- `GET /api/posts/trending` - Get trending posts

### Comments
- `POST /api/comments/post/:id` - Add comment
- `GET /api/comments/post/:id` - Get comments
- `POST /api/comments/:commentId/like` - Like comment
- `DELETE /api/comments/:commentId` - Delete comment

### Stories
- `POST /api/stories` - Create story
- `GET /api/stories` - Get stories feed
- `GET /api/stories/:id` - Get single story
- `POST /api/stories/:id/react` - React to story
- `POST /api/stories/:id/highlight` - Add to highlights
- `DELETE /api/stories/:id` - Delete story

### Reels
- `POST /api/reels` - Create reel
- `GET /api/reels` - Get reels feed
- `POST /api/reels/:id/like` - Like reel
- `DELETE /api/reels/:id` - Delete reel

### Messages
- `GET /api/messages/chats` - Get all chats
- `GET /api/messages/chat/:userId` - Get or create chat
- `GET /api/messages/:chatId` - Get messages
- `POST /api/messages/:chatId` - Send message
- `POST /api/messages/chats/group` - Create group chat

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Follow
- `POST /api/follows/:userId` - Follow/unfollow
- `POST /api/follows/:userId/accept` - Accept request
- `GET /api/follows/requests` - Get follow requests

### Search
- `GET /api/search/users?q=` - Search users
- `GET /api/search/hashtags?q=` - Search hashtags
- `GET /api/search/explore` - Explore page

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `POST /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/reports` - List reports

## License

MIT
