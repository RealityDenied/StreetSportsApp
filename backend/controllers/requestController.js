const TeamRequest = require('../models/TeamRequest');
const Team = require('../models/Team');
const Event = require('../models/Event');
const User = require('../models/User');

// Get user's pending requests
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await TeamRequest.find({ 
      receiver: userId, 
      status: 'pending' 
    })
      .populate('team', 'teamName')
      .populate('event', 'eventName sportType')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept team invitation
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await TeamRequest.findById(requestId);
    if (!request || request.receiver.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Add user to team
    const team = await Team.findById(request.team);
    if (!team.users.includes(userId)) {
      team.users.push(userId);
      await team.save();
    }

    // Emit acceptance to organizer
    const io = req.app.get('io');
    io.to(`user-${request.sender}`).emit('requestAccepted', {
      request: await TeamRequest.findById(request._id)
        .populate('team', 'teamName')
        .populate('event', 'eventName')
        .populate('receiver', 'name email')
    });

    res.json({ 
      success: true, 
      message: 'Request accepted successfully',
      request: await TeamRequest.findById(request._id)
        .populate('team', 'teamName')
        .populate('event', 'eventName')
        .populate('sender', 'name email')
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject team invitation
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await TeamRequest.findById(requestId);
    if (!request || request.receiver.toString() !== userId) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // Update request status
    request.status = 'rejected';
    await request.save();

    // Emit rejection to organizer
    const io = req.app.get('io');
    io.to(`user-${request.sender}`).emit('requestRejected', {
      request: await TeamRequest.findById(request._id)
        .populate('team', 'teamName')
        .populate('event', 'eventName')
        .populate('receiver', 'name email')
    });

    res.json({ 
      success: true, 
      message: 'Request rejected',
      request: await TeamRequest.findById(request._id)
        .populate('team', 'teamName')
        .populate('event', 'eventName')
        .populate('sender', 'name email')
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search users for team invitations
const searchUsers = async (req, res) => {
  try {
    const { query, eventId, teamId } = req.query;
    const userId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only organizer can search users' });
    }

    // Get users already in this team
    const team = await Team.findById(teamId);
    const teamUserIds = team ? team.users.map(id => id.toString()) : [];

    // Get users already invited to this team
    const pendingRequests = await TeamRequest.find({
      team: teamId,
      status: 'pending'
    });
    const invitedUserIds = pendingRequests.map(req => req.receiver.toString());

    // Search users excluding team members and already invited users
    const searchQuery = {
      _id: { 
        $nin: [...teamUserIds, ...invitedUserIds, userId] 
      }
    };

    if (query && query.trim()) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ];
    }

    const users = await User.find(searchQuery)
      .select('name email city favoriteSport')
      .limit(20)
      .sort({ name: 1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  acceptRequest,
  rejectRequest,
  searchUsers
};
