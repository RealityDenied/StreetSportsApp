const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  createEvent,
  getMyEvents,
  getMyParticipations,
  getAllEvents,
  getEvent,
  createTeam,
  inviteToTeam,
  removeTeamMember,
  promoteToCaptain,
  createMatch,
  updateMatchResult,
  uploadPoster,
  deletePoster,
  testCloudinary
} = require('../controllers/eventController');
const { upload } = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for temporary file storage
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Temporary directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const tempUpload = multer({ 
  storage: tempStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply auth middleware to all routes
router.use(verifyToken);

// Event routes
router.post('/create', createEvent);
router.get('/my-events', getMyEvents);
router.get('/my-participations', getMyParticipations);
router.get('/all', getAllEvents);
router.get('/:eventId', getEvent);

// Poster routes
router.post('/:eventId/poster/upload', tempUpload.single('poster'), uploadPoster);
router.delete('/:eventId/poster', deletePoster);

// Test route
router.get('/test-cloudinary', testCloudinary);

// Team routes
router.post('/:eventId/teams/create', createTeam);
router.post('/:eventId/teams/:teamId/invite', inviteToTeam);
router.delete('/:eventId/teams/:teamId/members/:userId', removeTeamMember);
router.put('/:eventId/teams/:teamId/members/:userId/promote', promoteToCaptain);

// Match routes
router.post('/:eventId/matches/create', createMatch);
router.put('/:eventId/matches/:matchId/result', updateMatchResult);

module.exports = router;