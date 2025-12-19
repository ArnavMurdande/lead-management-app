const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLead, deleteLead, addNote, importLeads, exportLeads, getDashboardStats } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/import')
  .post(authorize('super-admin', 'sub-admin'), upload.single('file'), importLeads);

router.route('/export')
  .get(exportLeads);

router.route('/stats')
  .get(getDashboardStats);

router.route('/:id')
  .put(updateLead)
  .delete(authorize('super-admin', 'sub-admin'), deleteLead);

router.route('/:id/note')
  .post(addNote);

module.exports = router;
