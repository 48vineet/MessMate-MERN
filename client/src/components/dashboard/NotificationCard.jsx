// src/components/dashboard/AttendanceCard.jsx
import { useState, useEffect, useRef } from 'react';
import {
  CalendarDaysIcon, ChartBarIcon, TrophyIcon, FireIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const AttendanceCard = ({ stats = {} }) => {
  const [attendanceData, setAttendanceData] = useState({
    thisMonth: { present: 0, total: 0, percentage: 0 },
    thisWeek: { present: 0, total: 0, percentage: 0 },
    streak: 0,
    weeklyData: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const errorShownRef = useRef({});

  // CORRECT: Do not double /api here
  const ATTENDANCE_ENDPOINT = '/user/attendance';

  useEffect(() => {
    if (stats && Object.keys(stats).length > 0) {
      setAttendanceData({
        thisMonth: stats.attendance?.thisMonth || { present: 0, total: 0, percentage: 0 },
        thisWeek: stats.attendance?.thisWeek || { present: 0, total: 0, percentage: 0 },
        streak: stats.attendance?.streak || 0,
        weeklyData: stats.attendance?.weeklyData || []
      });
    } else {
      // Only fetch once on mount
      fetchAttendanceData();
    }
    // eslint-disable-next-line
  }, []); // Remove stats from dependency array to avoid infinite loop

  useEffect(() => {
    if (error && !errorShownRef.current[error]) {
      // Show error popup only once per error type
      window.__attendanceErrorShown = window.__attendanceErrorShown || {};
      if (!window.__attendanceErrorShown[error]) {
        window.__attendanceErrorShown[error] = true;
        errorShownRef.current[error] = true;
        // You can use a toast here if you want
        // toast.error(error);
      }
    }
  }, [error]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ATTENDANCE_ENDPOINT);
      if (response.data && response.data.attendance) {
        setAttendanceData(response.data.attendance);
      } else {
        setError('No attendance data available.');
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setError('Attendance API not found. Contact your administrator.');
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to fetch attendance data.');
      }
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStreakBadge = (streak) => {
    if (streak >= 30) return { icon: TrophyIcon, color: 'text-yellow-600', label: 'Champion!' };
    if (streak >= 14) return { icon: FireIcon, color: 'text-orange-600', label: 'On Fire!' };
    if (streak >= 7) return { icon: ChartBarIcon, color: 'text-blue-600', label: 'Great!' };
    return { icon: CalendarDaysIcon, color: 'text-gray-600', label: 'Keep Going!' };
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const streakBadge = getStreakBadge(attendanceData.streak);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <CalendarDaysIcon className="h-12 w-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-700 mb-2 font-semibold">{error}</p>
        <button
          onClick={fetchAttendanceData}
          className="mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Attendance</h3>
          <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {/* Monthly Attendance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">This Month</span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${getAttendanceColor(attendanceData.thisMonth.percentage)}`}>
              {attendanceData.thisMonth.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              initial={{ width: 0 }}
              animate={{ width: `${attendanceData.thisMonth.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${
                attendanceData.thisMonth.percentage >= 90 ? 'bg-green-500' :
                attendanceData.thisMonth.percentage >= 75 ? 'bg-yellow-500' :
                attendanceData.thisMonth.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
              }`}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {attendanceData.thisMonth.present} of {attendanceData.thisMonth.total} meals attended
          </p>
        </div>
        {/* Weekly Attendance */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">This Week</span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${getAttendanceColor(attendanceData.thisWeek.percentage)}`}>
              {attendanceData.thisWeek.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              initial={{ width: 0 }}
              animate={{ width: `${attendanceData.thisWeek.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-2 rounded-full ${
                attendanceData.thisWeek.percentage >= 90 ? 'bg-green-500' :
                attendanceData.thisWeek.percentage >= 75 ? 'bg-yellow-500' :
                attendanceData.thisWeek.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
              }`}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {attendanceData.thisWeek.present} of {attendanceData.thisWeek.total} meals attended
          </p>
        </div>
        {/* Current Streak */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Current Streak</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-gray-900">{attendanceData.streak}</span>
                <span className="text-sm text-gray-600 ml-1">days</span>
              </div>
            </div>
            <div className={`p-3 rounded-full bg-white ${streakBadge.color}`}>
              <streakBadge.icon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{streakBadge.label}</p>
        </div>
        {/* Weekly Pattern */}
        {attendanceData.weeklyData && attendanceData.weeklyData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">This Week's Pattern</h4>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, index) => {
                const dayData = attendanceData.weeklyData[index] || { attended: false, total: 0 };
                return (
                  <div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium mb-1 ${
                      dayData.attended ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {dayData.total > 0 ? (dayData.attended ? '✓' : '✗') : '-'}
                    </div>
                    <p className="text-xs text-gray-600">{day}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Attendance Goals */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Goals</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target Attendance</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current</span>
              <span className={`font-medium ${
                attendanceData.thisMonth.percentage >= 85 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {attendanceData.thisMonth.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${
                attendanceData.thisMonth.percentage >= 85 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {attendanceData.thisMonth.percentage >= 85 ? 'On Track' : 'Need Improvement'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
