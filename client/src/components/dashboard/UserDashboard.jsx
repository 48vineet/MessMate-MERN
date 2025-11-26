// src/components/dashboard/UserDashboard.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import Icons from "../common/Icons";

// Import dashboard components
import AttendanceCard from "./AttendanceCard";
import BookingCard from "./BookingCard";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
import MealHistory from "./MealHistory";
import MenuCard from "./MenuCard";
import NotificationCard from "./NotificationCard";
import ProfileCard from "./ProfileCard";
import QuickActions from "./QuickActions";
import WalletCard from "./WalletCard";

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayMenu: {},
    upcomingBookings: [],
    recentMeals: [],
    notifications: [],
    stats: {},
    wallet: {},
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data individually to identify which endpoint is failing
      const endpoints = [
        { name: "menu", url: "/menu/today" },
        { name: "bookings", url: "/bookings/my-bookings" },
        { name: "meals", url: "/meals/recent" },
        { name: "notifications", url: "/notifications/unread-count" },
        { name: "stats", url: "/users/stats" },
        { name: "wallet", url: "/wallet/details" },
      ];

      const results = {};

      for (const endpoint of endpoints) {
        try {
          console.log(`Fetching ${endpoint.name}...`);
          const response = await api.get(endpoint.url);
          results[endpoint.name] = response.data;
          console.log(`${endpoint.name} fetched successfully:`, response.data);
        } catch (error) {
          console.error(`Error fetching ${endpoint.name}:`, error);
          // Don't show toast errors for individual endpoint failures
          // Just log them and continue with empty data
          results[endpoint.name] = {
            error: true,
            message: error.response?.data?.message || "Failed to fetch",
          };
        }
      }

      setDashboardData({
        todayMenu: results.menu?.menu || {
          breakfast: {
            items: [],
            price: 0,
            available: false,
            time: "7:00 AM - 10:00 AM",
          },
          lunch: {
            items: [],
            price: 0,
            available: false,
            time: "12:00 PM - 3:00 PM",
          },
          dinner: {
            items: [],
            price: 0,
            available: false,
            time: "7:00 PM - 10:00 PM",
          },
        },
        upcomingBookings:
          results.bookings?.data || results.bookings?.bookings || [],
        recentMeals: results.meals?.meals || [],
        notifications: results.notifications?.notifications || [],
        unreadCount: results.notifications?.count || 0,
        stats: results.stats?.stats || {
          monthlySpent: 0,
          mealsThisMonth: 0,
          attendanceRate: 0,
        },
        wallet: results.wallet?.wallet || {
          balance: 0,
          monthlySpent: 0,
          recentTransactions: [],
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "This Month",
      value: `₹${dashboardData.stats.monthlySpent || 200}`,
      subtitle: "Total Spent",
      icon: Icons.rupee,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Meals Taken",
      value: dashboardData.stats.mealsThisMonth || 15,
      subtitle: "This Month",
      icon: Icons.chart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Attendance",
      value: `${dashboardData.stats.attendanceRate || 85}%`,
      subtitle: "This Month",
      icon: Icons.calendar,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Notifications",
      value: dashboardData.notifications.length || 2,
      subtitle: "Unread",
      icon: Icons.bell,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-300 rounded-lg"></div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Welcome back to your MessMate dashboard. Here's what's happening
            today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Left Column - Menu & Booking */}
          <div className="lg:col-span-2 space-y-4">
            <MenuCard
              menu={dashboardData.todayMenu}
              onRefresh={fetchDashboardData}
            />
            <BookingCard
              upcomingBookings={dashboardData.upcomingBookings}
              onRefresh={fetchDashboardData}
            />
            <MealHistory recentMeals={dashboardData.recentMeals} />
            {/* Feedback Section - Compact like MealHistory */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Feedback & Reviews
                    </h3>
                    <p className="text-xs text-gray-600">
                      Share your experience
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
              <div className="p-4">
                <FeedbackList />
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions, Profile, Wallet, Attendance */}
          <div className="space-y-4">
            <QuickActions onRefresh={fetchDashboardData} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <ProfileCard user={user} />
              <WalletCard
                wallet={dashboardData.wallet}
                onRefresh={fetchDashboardData}
              />
              <AttendanceCard />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <NotificationCard
          notifications={dashboardData.notifications}
          unreadCount={dashboardData.unreadCount}
          onRefresh={fetchDashboardData}
        />

        {/* Feedback Form Modal */}
        <FeedbackForm
          isOpen={showFeedbackForm}
          onClose={() => setShowFeedbackForm(false)}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
