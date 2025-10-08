const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER (manual signup)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body; //destructuring syntax
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, roles });
    //User.create({
    //   name: name,
    //   email: email,
    //   password: hashedPassword,
    //   roles: roles
    // });

    const token = generateToken(newUser);

    res.json({ message: "User registered successfully", user: newUser, token }); 
    //token:token not written bcz js shorthand prop when key name: value name is same , just write keyname 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  LOGIN (manual)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GOOGLE LOGIN/SIGNUP
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;

    // verify google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    // check existing user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, roles: ['viewer'] });
    }

    const token = generateToken(user);
    res.json({ message: "Google Auth successful", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
