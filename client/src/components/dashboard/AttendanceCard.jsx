import {
  CalendarDaysIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const AttendanceCard = ({ stats = {} }) => {
  const { user } = useAuth(); // get logged-in user dynamically
  const [attendanceData, setAttendanceData] = useState({
    thisMonth: { present: 0, total: 0, percentage: 0 },
    thisWeek: { present: 0, total: 0, percentage: 0 },
    streak: 0,
    weeklyData: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attendance endpoint
  const ATTENDANCE_ENDPOINT = "/user/attendance";

  // When stats are given via props, use them
  useEffect(() => {
    if (stats && Object.keys(stats).length > 0) {
      setAttendanceData({
        thisMonth: stats.attendance?.thisMonth || {
          present: 0,
          total: 0,
          percentage: 0,
        },
        thisWeek: stats.attendance?.thisWeek || {
          present: 0,
          total: 0,
          percentage: 0,
        },
        streak: stats.attendance?.streak || 0,
        weeklyData: stats.attendance?.weeklyData || [],
      });
    }
  }, [stats]);

  // On mount, fetch attendance if needed (and user is loaded)
  useEffect(() => {
    if ((!stats || Object.keys(stats).length === 0) && user?._id) {
      fetchAttendanceData();
    }
  }, [user?._id]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass userId as param for dynamic data
      const response = await api.get(ATTENDANCE_ENDPOINT, {
        params: { userId: user?._id },
      });
      if (response.data && response.data.attendance) {
        setAttendanceData(response.data.attendance);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    if (percentage >= 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getStreakBadge = (streak) => {
    if (streak >= 30)
      return { icon: TrophyIcon, color: "text-yellow-600", label: "Champion!" };
    if (streak >= 14)
      return { icon: FireIcon, color: "text-orange-600", label: "On Fire!" };
    if (streak >= 7)
      return { icon: ChartBarIcon, color: "text-blue-600", label: "Great!" };
    return {
      icon: CalendarDaysIcon,
      color: "text-gray-600",
      label: "Keep Going!",
    };
  };

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Attendance</h3>
          <CalendarDaysIcon className="h-4 w-4 text-gray-600" />
        </div>
      </div>
      {/* Content */}
      <div className="p-3">
        {/* Monthly Attendance */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              This Month
            </span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${getAttendanceColor(
                attendanceData.thisMonth.percentage
              )}`}
            >
              {attendanceData.thisMonth.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                attendanceData.thisMonth.percentage >= 90
                  ? "bg-green-500"
                  : attendanceData.thisMonth.percentage >= 75
                  ? "bg-yellow-500"
                  : attendanceData.thisMonth.percentage >= 60
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${attendanceData.thisMonth.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {attendanceData.thisMonth.present} of{" "}
            {attendanceData.thisMonth.total} meals
          </p>
        </div>
        {/* Weekly Attendance */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">This Week</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${getAttendanceColor(
                attendanceData.thisWeek.percentage
              )}`}
            >
              {attendanceData.thisWeek.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ease-out delay-200 ${
                attendanceData.thisWeek.percentage >= 90
                  ? "bg-green-500"
                  : attendanceData.thisWeek.percentage >= 75
                  ? "bg-yellow-500"
                  : attendanceData.thisWeek.percentage >= 60
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${attendanceData.thisWeek.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {attendanceData.thisWeek.present} of {attendanceData.thisWeek.total}{" "}
            meals
          </p>
        </div>
        {/* Current Streak - Compact */}
        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
          <div>
            <p className="text-xs font-medium text-gray-700">Current Streak</p>
            <div className="flex items-center mt-1">
              <span className="text-lg font-bold text-gray-900">
                {attendanceData.streak}
              </span>
              <span className="text-xs text-gray-600 ml-1">days</span>
            </div>
          </div>
          <div className={`p-1.5 rounded-full bg-white ${streakBadge.color}`}>
            <streakBadge.icon className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
