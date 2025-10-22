const Event = require('../models/Event');
const Team = require('../models/Team');
const Match = require('../models/Match');
const TeamRequest = require('../models/TeamRequest');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Create new event
const createEvent = async (req, res) => {
  try {
    const { eventName, sportType, startDate, registrationDeadline } = req.body;
    const organiser = req.user.id;

    // Create event
    const event = new Event({
      eventName,
      sportType,
      organiser,
      startDate,
      registrationDeadline,
      teams: []
    });

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
      .populate('matches')
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
      .populate('matches');

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
  testCloudinary
};