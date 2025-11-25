// src/components/common/Sidebar.jsx
import {
  ArchiveBoxIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  EnvelopeIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const isAdmin = authUser?.role === "admin";

  const studentNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Menu", href: "/menu", icon: CalendarDaysIcon },
    { name: "My Bookings", href: "/bookings", icon: CalendarDaysIcon },
    { name: "Wallet", href: "/wallet", icon: CreditCardIcon },
    { name: "Profile", href: "/profile", icon: UserCircleIcon },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    {
      name: "User Management",
      icon: UsersIcon,
      children: [
        { name: "All Users", href: "/admin/users" },
        { name: "Add User", href: "/admin/users/add" },
        { name: "User Reports", href: "/admin/users/reports" },
      ],
    },
    {
      name: "Menu Management",
      icon: CalendarDaysIcon,
      children: [
        { name: "Daily Menus", href: "/admin/menu" },
        { name: "Menu Templates", href: "/admin/menu/templates" },
        { name: "Menu Analytics", href: "/admin/menu/analytics" },
      ],
    },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDaysIcon },
    { name: "Wallet Management", href: "/admin/wallet", icon: CreditCardIcon },
    { name: "Inventory", href: "/admin/inventory", icon: ArchiveBoxIcon },
    { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
    { name: "Reports", href: "/admin/reports", icon: DocumentChartBarIcon },
    { name: "Feedback", href: "/admin/feedback", icon: BellIcon },
    { name: "Settings", href: "/admin/settings", icon: CogIcon },
  ];

  const bottomNavigation = [
    { name: "Help & Support", href: "/help", icon: QuestionMarkCircleIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon },
    { name: "Contact Us", href: "/contact", icon: EnvelopeIcon },
  ];

  const navigation = isAdmin ? adminNavigation : studentNavigation;

  const toggleSubmenu = (itemName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  const isParentActive = (item) => {
    if (item.href) return isActive(item.href);
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -280 },
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200 ${
          !sidebarOpen ? "lg:hidden" : ""
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo with Hide Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MessMate</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-gray-200"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3 border-2 border-gray-200">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isParentActive(item)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {expandedMenus[item.name] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedMenus[item.name] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-8 mt-1 space-y-1"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive(child.href)
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <span className="truncate">{child.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 p-2 space-y-1">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "tween", duration: 0.3 }}
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:hidden`}
          >
            <div className="flex flex-col h-full">
              {/* Logo with Close Button */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Link
                  to="/dashboard"
                  className="flex items-center"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    MessMate
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3 border-2 border-gray-200">
                      <span className="text-white font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            isParentActive(item)
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.name}</span>
                          {expandedMenus[item.name] ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedMenus[item.name] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-8 mt-1 space-y-1"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.name}
                                  to={child.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive(child.href)
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  <span className="truncate">{child.name}</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Bottom Navigation */}
              <div className="border-t border-gray-200 p-2 space-y-1">
                {bottomNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
