const Event = require('../models/Event');
const Team = require('../models/Team');
const Match = require('../models/Match');
const TeamRequest = require('../models/TeamRequest');
const User = require('../models/User');
const Audience = require('../models/Audience');
const { cloudinary } = require('../config/cloudinary');
// Initialize Stripe with proper error handling
let stripe;
try {
  const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef';
  stripe = require('stripe')(stripeKey);
  console.log('Stripe initialized with key:', stripeKey.substring(0, 20) + '...');
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
  stripe = null;
}
const fs = require('fs');
const path = require('path');

// Create new event
const createEvent = async (req, res) => {
  try {
    const { 
      eventName, 
      sportType, 
      startDate, 
      registrationDeadline,
      duration,
      audienceFree = true,
      playerFree = true,
      audienceFee = 0,
      playerFee = 0
    } = req.body;
    const organiser = req.user.id;

    // Create event
    const event = new Event({
      eventName,
      sportType,
      organiser,
      startDate,
      registrationDeadline,
      duration,
      audienceFree,
      playerFree,
      audienceFee,
      playerFee,
      teams: [],
      participants: []
    });

    await event.save();

    // Create audience document for this event
    const audience = new Audience({
      event: event._id,
      users: []
    });
    await audience.save();

    // Update event with audience reference
    event.audience = audience._id;
    await event.save();

    // Emit event creation
    const io = req.app.get('io');
    io.emit('eventCreated', {
      event: await Event.findById(event._id).populate('organiser', 'name email')
    });

    res.status(201).json({
      success: true,
      event: await Event.findById(event._id)
        .populate('organiser', 'name email')
        .populate('teams')
        .populate('participants', 'name email')
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get events where user is a participant (team member)
const getMyParticipations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find teams where user is a member
    const teams = await Team.find({ users: userId }).populate('event');
    
    // Extract unique events from teams
    const eventIds = [...new Set(teams.map(team => team.event._id.toString()))];
    
    // Fetch events with full details
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate('organiser', 'name email')
      .populate('teams')
      .populate('matches')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get my participations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's events (where user is organizer)
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.find({ organiser: userId })
      .populate('organiser', 'name email')
      .populate('teams')
      .populate('matches')
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' })
      .populate('organiser', 'name email')
      .populate('teams')
      .populate({
        path: 'matches',
        populate: [
          {
            path: 'highlights'
          },
          {
            path: 'teams',
            select: 'teamName'
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate('organiser', 'name email')
      .populate({
        path: 'teams',
        populate: {
          path: 'users',
          select: 'name email favoriteSport city'
        }
      })
      .populate({
        path: 'matches',
        populate: {
          path: 'highlights',
          populate: {
            path: 'createdBy',
            select: 'name email'
          }
        }
      })
      .populate('participants', 'name email favoriteSport city')
      .populate({
        path: 'audience',
        populate: {
          path: 'users',
          select: 'name email favoriteSport city'
        }
      });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create team (organizer only)
const createTeam = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { teamName, users } = req.body;
    const organiser = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organiser) {
      return res.status(403).json({ success: false, message: 'Only organizer can create teams' });
    }

    const team = new Team({
      teamName,
      event: eventId,
      users: users || [],
      captain: organiser
    });

    await team.save();

    // Add team to event
    event.teams.push(team._id);
    await event.save();

    // Emit team creation
    const io = req.app.get('io');
    io.emit('teamCreated', {
      eventId,
      team: await Team.findById(team._id).populate('users', 'name email')
    });

    res.status(201).json({
      success: true,
      team: await Team.findById(team._id).populate('users', 'name email')
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send team join request
const inviteToTeam = async (req, res) => {
  try {
    const { eventId, teamId } = req.params;
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    // Check if sender is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== senderId) {
      return res.status(403).json({ success: false, message: 'Only organizer can send invitations' });
    }

    // Check if team exists in event
    const team = await Team.findById(teamId);
    if (!team || team.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Team not found in this event' });
    }

    // Check if user is already in another team for this event
    const existingTeam = await Team.findOne({ 
      event: eventId, 
      users: receiverId 
    });
    
    if (existingTeam) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a member of another team in this event' 
      });
    }

    // Check if user is already in this team
    if (team.users.includes(receiverId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a member of this team' 
      });
    }

    // Create team request
    const teamRequest = new TeamRequest({
      team: teamId,
      event: eventId,
      sender: senderId,
      receiver: receiverId,
      message
    });

    await teamRequest.save();

    // Emit request to specific user
    const io = req.app.get('io');
    io.to(`user-${receiverId}`).emit('requestReceived', {
      request: await TeamRequest.findById(teamRequest._id)
        .populate('team', 'teamName')
        .populate('event', 'eventName sportType')
        .populate('sender', 'name email')
    });

    res.status(201).json({ success: true, request: teamRequest });
  } catch (error) {
    console.error('Invite to team error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove team member (organizer only)
const removeTeamMember = async (req, res) => {
  try {
    const { eventId, teamId, userId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can remove team members' });
    }

    // Check if team exists in event
    const team = await Team.findById(teamId);
    if (!team || team.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Team not found in this event' });
    }

    // Check if user is in the team
    if (!team.users.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is not a member of this team' });
    }

    // Remove user from team
    team.users = team.users.filter(id => id.toString() !== userId);
    
    // If user was captain, remove captain status
    if (team.captain && team.captain.toString() === userId) {
      team.captain = null;
    }

    await team.save();

    // Emit team update
    const io = req.app.get('io');
    io.emit('teamUpdated', {
      eventId,
      team: await Team.findById(team._id).populate('users', 'name email')
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Promote team member to captain (organizer only)
const promoteToCaptain = async (req, res) => {
  try {
    const { eventId, teamId, userId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can promote team members' });
    }

    // Check if team exists in event
    const team = await Team.findById(teamId);
    if (!team || team.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Team not found in this event' });
    }

    // Check if user is in the team
    if (!team.users.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is not a member of this team' });
    }

    // Set user as captain
    team.captain = userId;
    await team.save();

    // Emit team update
    const io = req.app.get('io');
    io.emit('teamUpdated', {
      eventId,
      team: await Team.findById(team._id).populate('users', 'name email')
    });

    res.json({ success: true, message: 'Member promoted to captain successfully' });
  } catch (error) {
    console.error('Promote to captain error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create match (organizer only)
const createMatch = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { teams } = req.body;
    const organiser = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organiser) {
      return res.status(403).json({ success: false, message: 'Only organizer can create matches' });
    }

    // Validate teams belong to this event
    const team1 = await Team.findById(teams[0]);
    const team2 = await Team.findById(teams[1]);
    
    if (!team1 || !team2 || 
        team1.event.toString() !== eventId || 
        team2.event.toString() !== eventId) {
      return res.status(400).json({ success: false, message: 'Teams must belong to this event' });
    }

    const match = new Match({
      event: eventId,
      teams: teams,
      status: 'pending'
    });

    await match.save();

    // Add match to event
    event.matches.push(match._id);
    await event.save();

    // Update team match counts
    await Team.updateMany(
      { _id: { $in: teams } },
      { $inc: { matchesResultPending: 1 } }
    );

    // Emit match creation
    const io = req.app.get('io');
    io.emit('matchCreated', {
      eventId,
      match: await Match.findById(match._id).populate('teams', 'teamName')
    });

    res.status(201).json({
      success: true,
      match: await Match.findById(match._id).populate('teams', 'teamName')
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update match result (organizer only)
const updateMatchResult = async (req, res) => {
  try {
    const { eventId, matchId } = req.params;
    const { wonTeamId, score } = req.body;
    const organiser = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organiser) {
      return res.status(403).json({ success: false, message: 'Only organizer can update match results' });
    }

    const match = await Match.findById(matchId);
    if (!match || match.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Update match
    match.won = wonTeamId;
    match.status = 'completed';
    if (score && score.trim() !== '') {
      match.score = score.trim();
    } else {
      match.score = null;
    }
    await match.save();

    // Update team statistics
    const teams = await Team.find({ _id: { $in: match.teams } });
    for (const team of teams) {
      team.matchesPlayed += 1;
      team.matchesResultPending -= 1;
      if (team._id.toString() === wonTeamId) {
        team.matchesWon += 1;
      }
      await team.save();
    }

    // Emit match result update
    const io = req.app.get('io');
    io.emit('matchResultUpdated', {
      eventId,
      match: await Match.findById(match._id).populate('teams', 'teamName')
    });

    res.json({
      success: true,
      match: await Match.findById(match._id).populate('teams', 'teamName')
    });
  } catch (error) {
    console.error('Update match result error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload event poster (organizer only)
const uploadPoster = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organiser = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organiser) {
      return res.status(403).json({ success: false, message: 'Only organizer can upload poster' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log('Uploaded file info:', req.file);

    // Upload to Cloudinary directly
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'street-sports/event-posters'
      // Removed transformations temporarily to test
    });

    console.log('Cloudinary upload result:', result);

    // Update event with poster info
    event.poster = {
      public_id: result.public_id,
      url: result.secure_url
    };
    await event.save();

    console.log('Saved poster info:', event.poster);

    // Clean up temporary file
    try {
      fs.unlinkSync(req.file.path);
      console.log('Temporary file deleted:', req.file.path);
    } catch (cleanupError) {
      console.warn('Could not delete temporary file:', cleanupError);
    }

    // Emit poster update
    const io = req.app.get('io');
    io.emit('posterUpdated', {
      eventId,
      poster: event.poster
    });

    res.json({
      success: true,
      poster: event.poster
    });
  } catch (error) {
    console.error('Upload poster error:', error);
    
    // Clean up temporary file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temporary file deleted after error:', req.file.path);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file after error:', cleanupError);
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete event poster (organizer only)
const deletePoster = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organiser = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organiser) {
      return res.status(403).json({ success: false, message: 'Only organizer can delete poster' });
    }

    if (event.poster && event.poster.public_id) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(event.poster.public_id);
      
      // Remove from database
      event.poster = undefined;
      await event.save();
    }

    // Emit poster deletion
    const io = req.app.get('io');
    io.emit('posterDeleted', { eventId });

    res.json({ success: true, message: 'Poster deleted successfully' });
  } catch (error) {
    console.error('Delete poster error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test Cloudinary connection
const testCloudinary = async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, cloudinary: result });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply as player to event
const applyAsPlayer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is already a participant
    if (event.participants.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already applied as player' });
    }

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({ 
      event: eventId, 
      users: userId 
    });
    
    if (existingTeam) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of a team in this event' 
      });
    }

    // If event is not free, return payment required
    if (!event.playerFree) {
      return res.status(402).json({ 
        success: false, 
        message: 'Payment required',
        fee: event.playerFee,
        type: 'player'
      });
    }

    // Add user to participants
    event.participants.push(userId);
    await event.save();

    res.json({ success: true, message: 'Applied as player successfully' });
  } catch (error) {
    console.error('Apply as player error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply as player to specific team
const applyToTeam = async (req, res) => {
  try {
    const { eventId, teamId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if team exists and belongs to event
    const team = await Team.findById(teamId);
    if (!team || team.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Team not found in this event' });
    }

    // Check if user is already in this team
    if (team.users.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of this team' 
      });
    }

    // Check if user is already in another team for this event
    const existingTeam = await Team.findOne({ 
      event: eventId, 
      users: userId 
    });
    
    if (existingTeam) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of another team in this event' 
      });
    }

    // If event is not free, return payment required
    if (!event.playerFree) {
      return res.status(402).json({ 
        success: false, 
        message: 'Payment required',
        fee: event.playerFee,
        type: 'player'
      });
    }

    // Add user to team
    team.users.push(userId);
    await team.save();

    res.json({ success: true, message: 'Applied to team successfully' });
  } catch (error) {
    console.error('Apply to team error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending player applications (organizer only)
const getPendingPlayers = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can view pending applications' });
    }

    const participants = await User.find({ _id: { $in: event.participants } })
      .select('name email favoriteSport city');

    res.json({ success: true, participants });
  } catch (error) {
    console.error('Get pending players error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve player (organizer assigns to team or adds to participants pool)
const approvePlayer = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { teamId } = req.body; // Optional - if provided, assign to specific team
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can approve players' });
    }

    // Check if user is in participants
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User not in pending applications' });
    }

    if (teamId) {
      // Assign to specific team
      const team = await Team.findById(teamId);
      if (!team || team.event.toString() !== eventId) {
        return res.status(404).json({ success: false, message: 'Team not found in this event' });
      }

      // Add user to team
      team.users.push(userId);
      await team.save();
    }

    // Remove from participants (whether assigned to team or not)
    event.participants = event.participants.filter(id => id.toString() !== userId);
    await event.save();

    res.json({ success: true, message: 'Player approved successfully' });
  } catch (error) {
    console.error('Approve player error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject player application
const rejectPlayer = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can reject players' });
    }

    // Check if user is in participants
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User not in pending applications' });
    }

    // Remove from participants
    event.participants = event.participants.filter(id => id.toString() !== userId);
    await event.save();

    res.json({ success: true, message: 'Player application rejected' });
  } catch (error) {
    console.error('Reject player error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Stripe Checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    console.log('Creating checkout session for:', { eventId, type, userId });

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get fee amount
    const amount = type === 'audience' ? event.audienceFee : event.playerFee;
    const feeType = type === 'audience' ? 'Audience' : 'Player';

    console.log('Event details:', { 
      eventName: event.eventName, 
      audienceFee: event.audienceFee, 
      playerFee: event.playerFee,
      amount,
      feeType 
    });

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is free, no payment required' 
      });
    }

    // Check minimum amount for Stripe (50 cents = ~₹40)
    const minimumAmount = 40; // ₹40 minimum for Stripe
    if (amount < minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum payment amount is ₹${minimumAmount}. Current amount ₹${amount} is too small for payment processing.`,
        minimumAmount: minimumAmount,
        currentAmount: amount
      });
    }

    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY in .env file');
      return res.status(500).json({
        success: false,
        message: 'Payment system not configured. Please contact administrator.',
        error: 'Stripe not initialized'
      });
    }

    console.log('Stripe is initialized, creating checkout session...');
    console.log('Amount:', amount, 'Type:', type, 'Event:', event.eventName);

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${event.eventName} - ${feeType} Registration`,
                description: `Registration fee for ${feeType.toLowerCase()} participation`,
              },
              unit_amount: amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}&type=${type}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${eventId}`,
        metadata: {
          eventId: eventId,
          userId: userId,
          type: type
        },
        customer_email: req.user.email,
      });
      console.log('Checkout session created successfully:', session.id);
    } catch (stripeError) {
      console.error('Stripe checkout session creation failed:', stripeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment session',
        error: stripeError.message
      });
    }

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

// Test Stripe connection
const testStripe = async (req, res) => {
  try {
    console.log('Testing Stripe connection...');
    console.log('Stripe secret key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set');
    
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        message: 'Stripe not initialized' 
      });
    }

    // Test Stripe API call
    const account = await stripe.accounts.retrieve();
    
    res.json({
      success: true,
      message: 'Stripe connection successful',
      account: {
        id: account.id,
        country: account.country,
        type: account.type
      }
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe connection failed',
      error: error.message
    });
  }
};

// Verify ticket QR code
const verifyTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { qrData } = req.body;

    // Parse QR data
    const ticketData = JSON.parse(qrData);
    
    // Verify ticket belongs to this event
    if (ticketData.eventId !== eventId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket does not belong to this event'
      });
    }

    // Find the user
    const user = await User.findById(ticketData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is in audience or participants
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let isValidTicket = false;
    let ticketType = '';

    // Check if user is in audience
    if (event.audience) {
      const audience = await Audience.findById(event.audience);
      if (audience && audience.users.includes(ticketData.userId)) {
        isValidTicket = true;
        ticketType = 'audience';
      }
    }

    // Check if user is in participants
    if (!isValidTicket && event.participants.includes(ticketData.userId)) {
      isValidTicket = true;
      ticketType = 'player';
    }

    // Check if user is in any team
    if (!isValidTicket) {
      for (const teamId of event.teams) {
        const team = await Team.findById(teamId);
        if (team && team.users.includes(ticketData.userId)) {
          isValidTicket = true;
          ticketType = 'player';
          break;
        }
      }
    }

    if (!isValidTicket) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket - user not registered for this event'
      });
    }

    // Create ticket response
    const ticket = {
      id: ticketData.ticketId,
      eventId: eventId,
      eventName: event.eventName,
      type: ticketType,
      amount: ticketType === 'audience' ? event.audienceFee : event.playerFee,
      timestamp: ticketData.timestamp,
      verified: true
    };

    res.json({
      success: true,
      ticket: ticket,
      user: {
        name: user.name,
        email: user.email,
        favoriteSport: user.favoriteSport,
        city: user.city
      },
      message: `Verified ${ticketType} ticket`
    });

  } catch (error) {
    console.error('Ticket verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying ticket'
    });
  }
};

// Complete registration after successful payment
const completeRegistrationAfterPayment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type } = req.body; // 'audience' or 'player'
    const userId = req.user.id;

    console.log('Complete registration request:', { eventId, type, userId });

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (type === 'audience') {
      // Add to audience
      if (!event.audience) {
        const audience = new Audience({
          event: eventId,
          users: [userId]
        });
        await audience.save();
        event.audience = audience._id;
        await event.save();
      } else {
        const audience = await Audience.findById(event.audience);
        if (!audience.users.includes(userId)) {
          audience.users.push(userId);
          await audience.save();
        }
      }
    } else if (type === 'player') {
      console.log('Adding player to event:', { eventId, userId, type });
      
      // Add to participants
      if (!event.participants.includes(userId)) {
        event.participants.push(userId);
        await event.save();
        console.log('Added user to participants:', userId);
      }
      
      // Also add to a default team if no teams exist yet
      if (event.teams.length === 0) {
        console.log('Creating default team for event');
        const defaultTeam = new Team({
          teamName: 'Team 1',
          event: eventId,
          captain: userId,
          users: [userId]
        });
        await defaultTeam.save();
        event.teams.push(defaultTeam._id);
        await event.save();
        console.log('Created default team and added user:', userId);
      } else {
        console.log('Event already has teams:', event.teams.length);
        // If teams exist, add user to the first team
        const firstTeam = await Team.findById(event.teams[0]);
        if (firstTeam && !firstTeam.users.includes(userId)) {
          firstTeam.users.push(userId);
          await firstTeam.save();
          console.log('Added user to existing team:', firstTeam.teamName);
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully registered as ${type}`,
      type: type
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate ticket by ID (one-time use)
const validateTicketById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Simple ticket ID validation - just check format
    if (!ticketId.startsWith('TICKET_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket format - must start with TICKET_'
      });
    }

    // Extract user ID from ticket data
    // The ticket ID should contain the user ID or we need to parse it from QR data
    let userId;
    
    // Try to extract user ID from ticket ID format: TICKET_timestamp_random_userIdShort
    const ticketParts = ticketId.split('_');
    if (ticketParts.length >= 4) {
      const userIdShort = ticketParts[3]; // Extract short user ID from ticket format
      
      // Find user by matching the last 8 characters of their ID
      const users = await User.find({});
      const matchingUser = users.find(user => user._id.toString().substr(-8) === userIdShort);
      
      if (!matchingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found for this ticket'
        });
      }
      
      userId = matchingUser._id.toString();
    } else {
      // If ticket format doesn't contain user ID, we need to ask for it
      return res.status(400).json({
        success: false,
        message: 'Ticket format invalid - cannot extract user ID. Please provide user ID separately.'
      });
    }
    
    console.log('Extracted user ID from ticket:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is registered for this event
    let isValidTicket = false;
    let ticketType = '';

    console.log('Checking user registration:', { userId, eventId });

    // Check if user is in audience
    if (event.audience) {
      const audience = await Audience.findById(event.audience);
      console.log('Audience check:', { 
        audienceExists: !!audience, 
        audienceUsers: audience?.users?.length || 0,
        userInAudience: audience?.users?.includes(userId) || false
      });
      if (audience && audience.users.includes(userId)) {
        isValidTicket = true;
        ticketType = 'audience';
        console.log('User found in audience');
      }
    }

    // Check if user is in participants
    if (!isValidTicket) {
      console.log('Participants check:', { 
        participantsCount: event.participants?.length || 0,
        userInParticipants: event.participants?.includes(userId) || false
      });
      if (event.participants.includes(userId)) {
        isValidTicket = true;
        ticketType = 'player';
        console.log('User found in participants');
      }
    }

    // Check if user is in any team
    if (!isValidTicket) {
      console.log('Teams check:', { teamsCount: event.teams?.length || 0 });
      for (const teamId of event.teams) {
        const team = await Team.findById(teamId);
        console.log('Team check:', { 
          teamId, 
          teamName: team?.teamName,
          teamUsers: team?.users?.length || 0,
          userInTeam: team?.users?.includes(userId) || false
        });
        if (team && team.users.includes(userId)) {
          isValidTicket = true;
          ticketType = 'player';
          console.log('User found in team:', team.teamName);
          break;
        }
      }
    }

    console.log('Final validation result:', { isValidTicket, ticketType });

    if (!isValidTicket) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket - user not registered for this event',
        debug: {
          userId,
          eventId,
          hasAudience: !!event.audience,
          participantsCount: event.participants?.length || 0,
          teamsCount: event.teams?.length || 0
        }
      });
    }

    // Create ticket response
    const ticket = {
      id: ticketId,
      eventId: eventId,
      eventName: event.eventName,
      type: ticketType,
      amount: ticketType === 'audience' ? event.audienceFee : event.playerFee,
      timestamp: new Date().toISOString(),
      validated: true
    };

    res.json({
      success: true,
      ticket: ticket,
      user: {
        name: user.name,
        email: user.email,
        favoriteSport: user.favoriteSport,
        city: user.city
      },
      message: `Valid ${ticketType} ticket`
    });

  } catch (error) {
    console.error('Ticket validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating ticket'
    });
  }
};

module.exports = {
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
};