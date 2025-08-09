// controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

exports.getUserAttendance = async (req, res) => {
  try {
    // In production, use req.user._id from authentication middleware.
    const userId = req.user?._id || req.query.userId;
    console.log('DEBUG ATTENDANCE CONTROLLER - req.user:', req.user);
    console.log('DEBUG ATTENDANCE CONTROLLER - userId:', userId);
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    // Find all attendance for this user, most recent at the top
    const attendances = await Attendance.find({ user: userId })
      .sort({ date: -1 });
    console.log('DEBUG ATTENDANCE CONTROLLER - attendances:', attendances);

    // If no attendance records, return empty attendance data
    if (!attendances || attendances.length === 0) {
      return res.json({
        attendance: {
          thisMonth: { present: 0, total: 0, percentage: 0 },
          thisWeek: { present: 0, total: 0, percentage: 0 },
          streak: 0,
          weeklyData: []
        }
      });
    }

    // Get stats for this month and week
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthAttendances = attendances.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const weekAttendances = attendances.filter(a => {
      const d = new Date(a.date);
      const week = getWeekNum(new Date());
      return getWeekNum(d) === week && d.getFullYear() === thisYear;
    });

    // Summary
    const thisMonthPresent = monthAttendances.filter(a => a.summary.attendedMeals > 0).length;
    const thisWeekPresent = weekAttendances.filter(a => a.summary.attendedMeals > 0).length;

    const stats = {
      attendance: {
        thisMonth: {
          present: thisMonthPresent,
          total: monthAttendances.length,
          percentage: monthAttendances.length === 0 ? 0 : Math.round((thisMonthPresent / monthAttendances.length) * 100),
        },
        thisWeek: {
          present: thisWeekPresent,
          total: weekAttendances.length,
          percentage: weekAttendances.length === 0 ? 0 : Math.round((thisWeekPresent / weekAttendances.length) * 100),
        },
        streak: attendances[0]?.streak?.currentStreak || 0,
        weeklyData: weekAttendances.map(a => ({
          date: a.date,
          attended: a.summary.attendedMeals > 0,
          total: a.summary.totalMeals,
        })),
      }
    };

    return res.json(stats);

    // Helper
    function getWeekNum(d) {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
      return weekNo;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch attendance data' });
  }
};
