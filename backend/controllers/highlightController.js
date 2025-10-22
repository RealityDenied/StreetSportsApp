const Highlight = require('../models/Highlight');
const Match = require('../models/Match');
const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// Create highlight (organizer only)
const createHighlight = async (req, res) => {
  try {
    console.log('=== HIGHLIGHT CREATION DEBUG ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID:', req.user?.id);
    
    const { eventId, matchId } = req.params;
    const { title, description, mediaType } = req.body;
    const organizerId = req.user.id;

    console.log('Extracted values:', { eventId, matchId, title, description, mediaType, organizerId });

    // Check if user is organizer
    const event = await Event.findById(eventId);
    console.log('Event found:', event ? 'Yes' : 'No');
    if (!event || event.organiser.toString() !== organizerId) {
      console.log('User is not organizer');
      return res.status(403).json({ success: false, message: 'Only organizer can create highlights' });
    }

    // Check if match exists and belongs to event
    const match = await Match.findById(matchId);
    console.log('Match found:', match ? 'Yes' : 'No');
    if (!match || match.event.toString() !== eventId) {
      console.log('Match not found in event');
      return res.status(404).json({ success: false, message: 'Match not found in this event' });
    }

    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ success: false, message: 'No media file provided' });
    }

    console.log('Starting Cloudinary upload...');
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'street-sports/highlights'
    });
    console.log('Cloudinary upload successful:', result.public_id);

    // Create highlight
    const highlight = new Highlight({
      match: matchId,
      title,
      description,
      mediaType,
      media: {
        public_id: result.public_id,
        url: result.secure_url
      },
      createdBy: organizerId
    });

    console.log('Saving highlight...');
    await highlight.save();
    console.log('Highlight saved with ID:', highlight._id);

    // Add highlight to match
    match.highlights.push(highlight._id);
    await match.save();
    console.log('Match updated with highlight');

    // Clean up temporary file
    try {
      fs.unlinkSync(req.file.path);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('Could not delete temporary file:', cleanupError);
    }

    console.log('Highlight creation successful');
    res.status(201).json({
      success: true,
      highlight: await Highlight.findById(highlight._id).populate('createdBy', 'name email')
    });
  } catch (error) {
    console.error('Create highlight error:', error);
    
    // Clean up temporary file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not delete temporary file after error:', cleanupError);
      }
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get highlights for a match
const getMatchHighlights = async (req, res) => {
  try {
    const { eventId, matchId } = req.params;

    // Check if match exists and belongs to event
    const match = await Match.findById(matchId);
    if (!match || match.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Match not found in this event' });
    }

    const highlights = await Highlight.find({ match: matchId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, highlights });
  } catch (error) {
    console.error('Get match highlights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete highlight (organizer only)
const deleteHighlight = async (req, res) => {
  try {
    const { eventId, matchId, highlightId } = req.params;
    const organizerId = req.user.id;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organiser.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Only organizer can delete highlights' });
    }

    // Check if match exists and belongs to event
    const match = await Match.findById(matchId);
    if (!match || match.event.toString() !== eventId) {
      return res.status(404).json({ success: false, message: 'Match not found in this event' });
    }

    const highlight = await Highlight.findById(highlightId);
    if (!highlight || highlight.match.toString() !== matchId) {
      return res.status(404).json({ success: false, message: 'Highlight not found' });
    }

    // Delete from Cloudinary
    if (highlight.media && highlight.media.public_id) {
      await cloudinary.uploader.destroy(highlight.media.public_id);
    }

    // Remove from match
    match.highlights = match.highlights.filter(id => id.toString() !== highlightId);
    await match.save();

    // Delete highlight
    await Highlight.findByIdAndDelete(highlightId);

    res.json({ success: true, message: 'Highlight deleted successfully' });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createHighlight,
  getMatchHighlights,
  deleteHighlight
};
