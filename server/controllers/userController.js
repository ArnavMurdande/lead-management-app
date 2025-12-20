const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // Import Log Model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/logger'); // Import Logger Helper

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
//  NEW: User Profile Logic (Self-Service)
// ==========================================

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        location: user.location,
        dob: user.dob,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile (Supports Image Uploads)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update text fields
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;
      user.dob = req.body.dob || user.dob;

      // --- IMAGE UPLOAD LOGIC ---
      if (req.file) {
        // Case 1: File uploaded via Multer
        // Construct the full URL to the file on your server
        // NOTE: In production (Render/Vercel), you might need a different strategy for file persistence (like S3/Cloudinary)
        // because Render wipes the disk on redeploy. For demo/local, this is fine.
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        user.profilePic = url;
      } else if (req.body.profilePic) {
        // Case 2: User provided a text URL (e.g., from Google or external link)
        user.profilePic = req.body.profilePic;
      }

      // Update password if provided
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      // [LOGGING] Track self-update
      await logActivity(
        req.user._id, 
        'UPDATE_PROFILE', 
        `User updated their own profile`, 
        req
      );

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
        phone: updatedUser.phone,
        location: updatedUser.location,
        dob: updatedUser.dob,
        token: generateToken(updatedUser._id), // Return new token so session stays fresh
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//  Admin Management Logic & Logging
// ==========================================

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a user (Admin)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
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
      role
    });

    // [LOGGING] Track Admin creation
    await logActivity(
        req.user._id, 
        'CREATE_USER', 
        `Admin created user: ${name} (${role})`, 
        req
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user by ID (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      
      const updatedUser = await user.save();
      
      // [LOGGING] Track Admin update
      await logActivity(
        req.user._id, 
        'UPDATE_USER', 
        `Admin updated user: ${updatedUser.name}`, 
        req
      );

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const userName = user.name; // Save name for log
      await user.deleteOne();

      // [LOGGING] Track Admin deletion
      await logActivity(
        req.user._id, 
        'DELETE_USER', 
        `Admin deleted user: ${userName}`, 
        req
      );

      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//  NEW: Activity Logs (Super Admin)
// ==========================================

// @desc    Get system activity logs
// @route   GET /api/users/activity
// @access  Private/Super Admin
exports.getActivityLogs = async (req, res) => {
    try {
      const logs = await ActivityLog.find()
        .populate('user', 'name role email') // Join with User data
        .sort({ timestamp: -1 }) // Sort by newest first
        .limit(100); // Limit to last 100 entries for performance
  
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};