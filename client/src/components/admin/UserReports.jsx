// src/components/admin/UserReports.jsx
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const UserReports = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [live, setLive] = useState(false);
  const socketRef = useRef(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchUserReport();
  }, [selectedDateRange]);

  // Establish a real-time socket connection (without auto-refresh)
  useEffect(() => {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
        /\/api$/,
        ""
      );

    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));

    // Removed auto-refresh on user events and periodic polling
    // Users can manually click "Generate Again" to refresh

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const buildEmptyUserData = () => ({
    summary: {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      activeUserPercentage: 0,
    },
    usersByRole: {},
    activity: {
      avgBookingsPerUser: 0,
      avgAmountPerUser: 0,
      activeUserCount: 0,
    },
    registrationTrends: [],
    dateRange: selectedDateRange,
  });

  const fetchUserReport = async () => {
    setLoading(true);
    try {
      const response = await api.post("/reports/generate", {
        type: "users",
        dateRange: selectedDateRange,
        includeCharts: true,
      });

      console.log("📥 Client received response:", response.data);

      // The server returns report.data directly, not nested
      const payload = response?.data?.report?.data || response?.data?.report;
      console.log("📊 Client payload:", payload);

      setUserData(payload || buildEmptyUserData());
    } catch (error) {
      console.error("Error fetching user report:", error);
      toast.error("Failed to load user report");
      // Show an empty, informative state instead of a blank page
      setUserData(buildEmptyUserData());
    } finally {
      setLoading(false);
    }
  };

  const downloadUserReport = async (format = "pdf") => {
    try {
      const response = await api.get("/reports/users/download", {
        params: { format, dateRange: selectedDateRange },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `user-report-${selectedDateRange.startDate}-to-${selectedDateRange.endDate}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("User report downloaded successfully");
    } catch (error) {
      console.error("Error downloading user report:", error);
      toast.error("Failed to download user report");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      student: "bg-blue-100 text-blue-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3 sm:w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`loading-card-${i}`}
                  className="h-24 sm:h-32 bg-gray-300 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Reports
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                User Analytics Report
              </h1>
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                Comprehensive user statistics and insights
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    live
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`mr-1 h-2 w-2 rounded-full ${
                      live ? "bg-green-600" : "bg-gray-400"
                    }`}
                  ></span>
                  {live ? "Live" : "Offline"}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDateRange.startDate}
                  onChange={(e) =>
                    setSelectedDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={selectedDateRange.endDate}
                  onChange={(e) =>
                    setSelectedDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => downloadUserReport("pdf")}
                  className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => downloadUserReport("excel")}
                  className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {userData && (
          <>
            {/* Empty Notice */}
            {userData.summary.totalUsers === 0 && (
              <div className="mb-4 sm:mb-6 rounded-lg border border-dashed border-gray-300 bg-white p-4 sm:p-5">
                <p className="text-sm sm:text-base text-gray-600">
                  No user data found for the selected range.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={fetchUserReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Generate Again
                  </button>
                  <button
                    onClick={() => downloadUserReport("pdf")}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Download Empty Template (PDF)
                  </button>
                </div>
              </div>
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                    <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {userData.summary.totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                    <UserPlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      New Users
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {userData.summary.newUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {userData.summary.activeUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                    <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Verified Users
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {userData.summary.verifiedUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Distribution by Role */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Users by Role
                </h3>
                <div className="space-y-4">
                  {Object.keys(userData.usersByRole).length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No role data available.
                    </p>
                  ) : (
                    Object.entries(userData.usersByRole).map(
                      ([role, count]) => (
                        <div key={role} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                                  role
                                )}`}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-gray-900">
                                {count}
                              </span>
                              <span className="text-sm text-gray-500">
                                (
                                {(
                                  (count /
                                    Math.max(userData.summary.totalUsers, 1)) *
                                  100
                                ).toFixed(1)}
                                %)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{
                                width: `${(
                                  (count /
                                    Math.max(userData.summary.totalUsers, 1)) *
                                  100
                                ).toFixed(0)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  User Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      Active User Percentage
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {userData.summary.activeUserPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Bookings per User</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {userData.activity.avgBookingsPerUser.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Amount per User</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{userData.activity.avgAmountPerUser.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      Active Users (with bookings)
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {userData.activity.activeUserCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trends */}
            {userData.registrationTrends &&
              userData.registrationTrends.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Registration Trends
                  </h3>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Registrations
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userData.registrationTrends
                          .slice(-10)
                          .map((trend, index) => (
                            <tr key={`trend-${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {trend._id.day}/{trend._id.month}/
                                {trend._id.year}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {trend.count}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {userData.registrationTrends.slice(-10).map((trend, i) => (
                      <div
                        key={`trend-card-${i}`}
                        className="py-3 flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {trend._id.day}/{trend._id.month}/{trend._id.year}
                        </div>
                        <div className="text-sm text-gray-700">
                          {trend.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Report Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Date Range:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(userData.dateRange.startDate).toLocaleDateString(
                      "en-IN"
                    )}{" "}
                    -
                    {new Date(userData.dateRange.endDate).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Generated:</span>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString("en-IN")} at{" "}
                    {new Date().toLocaleTimeString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600">✓ Complete</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserReports;
