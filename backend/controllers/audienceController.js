const Audience = require('../models/Audience');
const Event = require('../models/Event');
const User = require('../models/User');

// Join as audience
const joinAudience = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is already in audience
    let audience = await Audience.findOne({ event: eventId });
    if (audience && audience.users.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already in audience' });
    }

    // If event is not free, return payment required
    if (!event.audienceFree) {
      return res.status(402).json({ 
        success: false, 
        message: 'Payment required',
        fee: event.audienceFee,
        type: 'audience'
      });
    }

    // Create audience if doesn't exist
    if (!audience) {
      audience = new Audience({
        event: eventId,
        users: [userId]
      });
    } else {
      audience.users.push(userId);
    }

    await audience.save();

    // Update event with audience reference if not set
    if (!event.audience) {
      event.audience = audience._id;
      await event.save();
    }

    res.json({ success: true, message: 'Joined audience successfully' });
  } catch (error) {
    console.error('Join audience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audience list
const getAudience = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const audience = await Audience.findOne({ event: eventId })
      .populate('users', 'name email favoriteSport city');

    if (!audience) {
      return res.json({ success: true, audience: { users: [] } });
    }

    res.json({ success: true, audience });
  } catch (error) {
    console.error('Get audience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from audience (organizer only)
const removeFromAudience = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can remove audience members' });
    }

    const audience = await Audience.findOne({ event: eventId });
    if (!audience) {
      return res.status(404).json({ success: false, message: 'Audience not found' });
    }

    audience.users = audience.users.filter(id => id.toString() !== userId);
    await audience.save();

    res.json({ success: true, message: 'Removed from audience successfully' });
  } catch (error) {
    console.error('Remove from audience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  joinAudience,
  getAudience,
  removeFromAudience
};
