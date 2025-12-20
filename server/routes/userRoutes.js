const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserProfile, 
  updateUserProfile,
  getActivityLogs 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIGURATION (For Profile Pics) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// ==================================================================
//  ROUTES
// ==================================================================

// 1. Profile Routes (Self-Service)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profilePic'), updateUserProfile);

// 2. Activity Logs (Super Admin Only)
router.get('/activity', protect, authorize('super-admin'), getActivityLogs);

// 3. User Management (General)
router.route('/')
  .get(protect, authorize('super-admin', 'sub-admin'), getUsers) // Sub-admins can still view list
  .post(protect, authorize('super-admin'), createUser); // <--- FIXED: Only Super Admin can create

// 4. User Management (Specific ID)
router.route('/:id')
  .delete(protect, authorize('super-admin'), deleteUser)
  .put(protect, authorize('super-admin'), updateUser);

module.exports = router;