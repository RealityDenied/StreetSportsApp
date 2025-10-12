const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { getMe, updateProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.put("/update-profile", verifyToken, updateProfile);

module.exports = router;
