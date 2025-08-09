// routes/attendance.js
const express = require('express');
const router = express.Router();
const { getUserAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect); // Ensure authentication

// GET /api/user/attendance
router.get('/', getUserAttendance);

module.exports = router;
