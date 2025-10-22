const User = require("../models/User");

// get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update onboarding/profile info
exports.updateProfile = async (req, res) => {
  try {
    const { age, city, favoriteSport, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        age,
        city,
        favoriteSport,
        role,
        profileCompleted: true,
      },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update user profile fields (city and favorite sport only)
exports.updateProfileFields = async (req, res) => {
  try {
    const { city, favoriteSport } = req.body;

    // Validate input
    if (!city && !favoriteSport) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one field (city or favoriteSport) must be provided" 
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (city !== undefined) updateData.city = city;
    if (favoriteSport !== undefined) updateData.favoriteSport = favoriteSport;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ 
      success: true,
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
