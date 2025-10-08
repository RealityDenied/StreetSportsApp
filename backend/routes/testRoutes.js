// backend/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// quick endpoint to create a test user (no auth)
router.post('/create-user', async (req, res) => {
  try {
    const payload = {
      name: req.body.name || "Test User",
      email: req.body.email || `test${Date.now()}@example.com`,
    };
    const user = await User.create(payload);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  const users = await User.find().limit(20);
  res.json(users);
});

module.exports = router;
