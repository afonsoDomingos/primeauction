const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io config
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/support', require('./routes/support'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/comments', require('./routes/comments'));

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  socket.on('join_auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });

  socket.on('leave_auction', (auctionId) => {
    socket.leave(auctionId);
    console.log(`Socket ${socket.id} left auction ${auctionId}`);
  });

  // Chat functionality
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on('leave_user', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`Socket ${socket.id} left user room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start Cron Jobs
const startCronJobs = require('./cron');
startCronJobs(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
