const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  acceptRequest,
  rejectRequest,
  searchUsers
} = require('../controllers/requestController');

// Apply auth middleware to all routes
router.use(verifyToken);

// Request routes
router.get('/notifications', getNotifications);
router.post('/:requestId/accept', acceptRequest);
router.post('/:requestId/reject', rejectRequest);
router.get('/search-users', searchUsers);

module.exports = router;
