// backend/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');




dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// test root
app.get('/', (req, res) => res.send('Street Sports API — backend running '));

// test routes
const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

//auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));


