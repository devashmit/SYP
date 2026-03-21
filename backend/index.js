const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const prisma = require('./prisma/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sahayogi_secret_key_2024';
const notificationService = require('./services/notification.service');

// Initialize Notification Service
notificationService.setIO(io);

// Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
  if (!token) return next(new Error('Authentication error: Token missing'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid or expired token'));
    socket.user = decoded; // Contains id, role, etc.
    next();
  });
});

// Secure Socket Connect Handling
io.on('connection', (socket) => {
  // Automatically join their personal room based on verified secure token
  socket.join(socket.user.id);
  
  // Explicitly join an admin room for system-wide broadcasts to admins
  if (socket.user.role === 'admin') {
    socket.join('admin_room');
  }

  // Fallback for old clients (can be removed once frontend is fully updated)
  socket.on('join', (userId) => {
    if (userId === socket.user.id) {
       socket.join(userId);
    }
  });
});

// --- Mount Routes ---
const authRoutes = require('./routes/auth.routes');
const createPostsRouter = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');
const messagesRoutes = require('./routes/messages.routes');
const createNotificationsRouter = require('./routes/notifications.routes');
const createAdminRouter = require('./routes/admin.routes');

// Create router instances (posts and admin need io for socket events)
const postsRouter = createPostsRouter(io);
const messagesRouter = messagesRoutes(io);
const notificationsRouter = createNotificationsRouter(io);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', createAdminRouter(io));

// Explicit backward compatibility mounts
// This prevents wildcard routes (/:id) in postsRouter and messagesRouter
// from completely hijacking other root-level /api/xxxx endpoints.
app.use('/api', (req, res, next) => {
    const p = req.path;
    if (p === '/categories' || p === '/my-posts' || p === '/community-needs') {
        return postsRouter(req, res, next);
    }
    if (p === '/conversations') {
        return messagesRouter(req, res, next);
    }
    if (p.startsWith('/profiles/')) {
        return usersRoutes(req, res, next);
    }
    next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: 'Disconnected', error: error.message });
  }
});

// 404 Handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (req.path.startsWith('/api')) {
    return res.status(status).json({
      error: err.message || 'Internal Server Error',
      path: req.originalUrl
    });
  }
  res.status(status).send(err.message || 'Internal Server Error');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
