// backend/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Both Vite ports
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// test root
app.get('/', (req, res) => res.send('Street Sports API — backend running '));

// test routes
const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

//auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

//user routes
const userRoutes = require("./routes/userRoutes.js");
app.use("/api/user", userRoutes);

//event routes
const eventRoutes = require("./routes/eventRoutes.js");
app.use("/api/events", eventRoutes);

//request routes
const requestRoutes = require("./routes/requestRoutes.js");
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));


