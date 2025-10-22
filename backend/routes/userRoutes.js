const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { getMe, updateProfile, updateProfileFields } = require("../controllers/userController");

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.get("/profile", verifyToken, getMe); // Alias for /me
router.put("/update-profile", verifyToken, updateProfile);
router.put("/profile", verifyToken, updateProfileFields); // New endpoint for profile fields update

module.exports = router;
