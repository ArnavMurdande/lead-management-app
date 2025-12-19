const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('super-admin', 'sub-admin'), getUsers)
  .post(protect, authorize('super-admin'), createUser);

router.route('/:id')
  .put(protect, authorize('super-admin'), updateUser)
  .delete(protect, authorize('super-admin'), deleteUser);

module.exports = router;
