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

// Socket connect handling
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

// --- Mount Routes ---
const authRoutes = require('./routes/auth.routes');
const createPostsRouter = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');
const messagesRoutes = require('./routes/messages.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const createAdminRouter = require('./routes/admin.routes');

// Create router instances (posts and admin need io for socket events)
const postsRouter = createPostsRouter(io);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);          // /api/posts, /api/posts/:id, etc.
app.use('/api', postsRouter);                // /api/categories, /api/my-posts, /api/community-needs
app.use('/api/users', usersRoutes);          // /api/users/search
app.use('/api', usersRoutes);                // /api/profiles/:id (backward compat)
app.use('/api/messages', messagesRoutes);    // /api/messages, /api/messages/:id, /api/messages/read/:id
app.use('/api', messagesRoutes);             // /api/conversations
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', createAdminRouter(io));

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
