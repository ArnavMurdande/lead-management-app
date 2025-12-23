const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { logActivity } = require('../utils/logger'); // Import Logger

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  // CHANGE '30d' TO '24h' or '12h'
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' }); 
};

// --- Standard Login ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if email or name matches
    const user = await User.findOne({ 
      $or: [{ email: email }, { name: email }] 
    });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      
      // 1. Update Last Login Timestamp
      user.lastLogin = Date.now();
      await user.save();

      // 2. Log Activity
      await logActivity(user._id, 'LOGIN', 'User logged in', req);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Standard Register ---
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'support-agent',
      lastLogin: Date.now() // Set initial login time
    });

    if (user) {
      // Log Registration
      await logActivity(user._id, 'REGISTER', 'User registered new account', req);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Google Login ---
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the token
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, picture } = ticket.getPayload(); 

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
        // User exists -> Log them in & Update Timestamp
        user.lastLogin = Date.now();
        await user.save();

        await logActivity(user._id, 'LOGIN_GOOGLE', 'User logged in via Google', req);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic, 
            token: generateToken(user._id),
        });
    } else {
        // User does not exist -> Register
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            profilePic: picture, 
            role: 'support-agent',
            lastLogin: Date.now()
        });

        await logActivity(user._id, 'REGISTER_GOOGLE', 'User registered via Google', req);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            token: generateToken(user._id),
        });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};