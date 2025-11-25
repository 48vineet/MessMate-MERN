// src/components/common/Header.jsx
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  CogIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const Header = ({ user, sidebarOpen, setSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/recent?limit=5");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getPageTitle = () => {
    const pathMap = {
      "/dashboard": "Dashboard",
      "/menu": "Menu",
      "/bookings": "My Bookings",
      "/wallet": "Wallet",
      "/profile": "Profile",
      "/admin/dashboard": "Admin Dashboard",
      "/admin/users": "User Management",
      "/admin/menu": "Menu Management",
      "/admin/bookings": "Booking Management",
      "/admin/analytics": "Analytics",
      "/admin/inventory": "Inventory",
      "/admin/reports": "Reports",
      "/admin/settings": "Settings",
    };
    return pathMap[location.pathname] || "MessMate";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors mr-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center ml-4 lg:ml-0">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                MessMate
              </span>
            </Link>

            {/* Page Title */}
            <div className="hidden md:block ml-8">
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500">
                {getGreeting()}, {user?.name}
              </p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search menus, bookings..."
                />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() =>
                              markNotificationRead(notification._id)
                            }
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 border-t border-gray-200">
                        <Link
                          to="/notifications"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  />
                ) : (
                  <div className="h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="font-medium text-sm">{user?.name}</span>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        {user?.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt={user.name}
                            className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-white font-bold text-xl">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {user?.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {user?.email}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                              {user?.role}
                            </span>
                            {user?.isVerified && (
                              <div className="ml-2 p-1 bg-green-100 rounded-full">
                                <svg
                                  className="h-3 w-3 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors mr-3">
                          <UserCircleIcon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Profile</div>
                          <div className="text-xs text-gray-500">
                            Manage your account
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors mr-3">
                          <CogIcon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Settings</div>
                          <div className="text-xs text-gray-500">
                            App preferences
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mx-4"></div>

                    {/* Sign Out */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                      >
                        <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors mr-3">
                          <ArrowRightOnRectangleIcon className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">Sign out</div>
                          <div className="text-xs text-red-500">
                            Logout from your account
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
