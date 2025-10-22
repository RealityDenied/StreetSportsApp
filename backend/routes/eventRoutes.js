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
  testCloudinary,
  applyAsPlayer,
  applyToTeam,
  getPendingPlayers,
  approvePlayer,
  rejectPlayer,
  createCheckoutSession,
  testStripe,
  verifyTicket,
  completeRegistrationAfterPayment,
  validateTicketById
} = require('../controllers/eventController');
const {
  joinAudience,
  getAudience,
  removeFromAudience
} = require('../controllers/audienceController');
const {
  createHighlight,
  getMatchHighlights,
  deleteHighlight
} = require('../controllers/highlightController');
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
    fileSize: 10 * 1024 * 1024 // 10MB limit for highlights (videos)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

const posterUpload = multer({ 
  storage: tempStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for posters
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
router.post('/:eventId/poster/upload', posterUpload.single('poster'), uploadPoster);
router.delete('/:eventId/poster', deletePoster);

// Test route
router.get('/test-cloudinary', testCloudinary);

// Audience routes
router.post('/:eventId/audience/join', joinAudience);
router.get('/:eventId/audience', getAudience);
router.delete('/:eventId/audience/:userId', removeFromAudience);

// Player application routes
router.post('/:eventId/players/apply', applyAsPlayer);
router.post('/:eventId/players/apply-to-team/:teamId', applyToTeam);
router.get('/:eventId/players/pending', getPendingPlayers);
router.post('/:eventId/players/:userId/approve', approvePlayer);
router.delete('/:eventId/players/:userId/reject', rejectPlayer);

// Team routes
router.post('/:eventId/teams/create', createTeam);
router.post('/:eventId/teams/:teamId/invite', inviteToTeam);
router.delete('/:eventId/teams/:teamId/members/:userId', removeTeamMember);
router.put('/:eventId/teams/:teamId/members/:userId/promote', promoteToCaptain);

// Match routes
router.post('/:eventId/matches/create', createMatch);
router.put('/:eventId/matches/:matchId/result', updateMatchResult);

// Highlight routes
router.post('/:eventId/matches/:matchId/highlights', tempUpload.single('media'), createHighlight);
router.get('/:eventId/matches/:matchId/highlights', getMatchHighlights);
router.delete('/:eventId/matches/:matchId/highlights/:highlightId', deleteHighlight);

// Payment routes
router.post('/:eventId/create-checkout-session', verifyToken, createCheckoutSession);

// Ticket verification routes
router.post('/:eventId/verify-ticket', verifyToken, verifyTicket);
router.post('/:eventId/validate-ticket', verifyToken, validateTicketById);

// Post-payment registration completion
router.post('/:eventId/complete-registration', verifyToken, completeRegistrationAfterPayment);

// Test routes
router.get('/test-stripe', testStripe);
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;