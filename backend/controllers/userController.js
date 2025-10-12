const User = require("../models/User");

// get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
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
