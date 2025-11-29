import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user } = useAuth();

  const [results, setResults] = useState({
    menus: [],
    bookings: [],
    pages: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Define available pages/routes (excluding admin routes)
  const availablePages = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: HomeIcon,
      description: "View your dashboard and overview",
      keywords: ["home", "main", "dashboard", "overview"],
    },
    {
      name: "Menu",
      path: "/menu",
      icon: DocumentTextIcon,
      description: "Browse daily menus and meals",
      keywords: [
        "menu",
        "food",
        "meals",
        "today",
        "breakfast",
        "lunch",
        "dinner",
      ],
    },
    {
      name: "My Bookings",
      path: "/bookings",
      icon: CalendarDaysIcon,
      description: "View and manage your meal bookings",
      keywords: ["bookings", "reservations", "orders", "book", "reserve"],
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: CreditCardIcon,
      description: "Manage your wallet and payments",
      keywords: ["wallet", "payment", "recharge", "balance", "money", "pay"],
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircleIcon,
      description: "View and edit your profile",
      keywords: ["profile", "account", "settings", "personal", "info"],
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: NoSymbolIcon,
      description: "View all notifications",
      keywords: ["notifications", "alerts", "updates", "messages"],
    },
    {
      name: "Help & Support",
      path: "/help",
      icon: QuestionMarkCircleIcon,
      description: "Get help and support",
      keywords: ["help", "support", "faq", "assistance", "guide"],
    },
    {
      name: "Contact Us",
      path: "/contact",
      icon: EnvelopeIcon,
      description: "Contact us for inquiries",
      keywords: ["contact", "reach", "email", "message", "support"],
    },
    {
      name: "About",
      path: "/about",
      icon: DocumentTextIcon,
      description: "Learn more about MessMate",
      keywords: ["about", "info", "information", "company"],
    },
    {
      name: "Privacy Policy",
      path: "/privacy",
      icon: DocumentTextIcon,
      description: "Read our privacy policy",
      keywords: ["privacy", "policy", "data", "security"],
    },
    {
      name: "Terms of Service",
      path: "/terms",
      icon: DocumentTextIcon,
      description: "Read our terms of service",
      keywords: ["terms", "service", "conditions", "agreement"],
    },
  ];

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      setResults({ menus: [], bookings: [], users: [] });
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const lowerQuery = searchQuery.toLowerCase().trim();

      // Search in multiple endpoints
      const [menuResponse, bookingResponse] = await Promise.allSettled([
        api.get(`/menu/search?q=${encodeURIComponent(searchQuery)}`),
        api.get(`/bookings/search?q=${encodeURIComponent(searchQuery)}`),
      ]);

      // Search pages locally
      const matchedPages = availablePages.filter(
        (page) =>
          page.name.toLowerCase().includes(lowerQuery) ||
          page.description.toLowerCase().includes(lowerQuery) ||
          page.keywords.some((keyword) => keyword.includes(lowerQuery))
      );

      const searchResults = {
        menus:
          menuResponse.status === "fulfilled" &&
          menuResponse.value.data?.data?.menus
            ? menuResponse.value.data.data.menus
            : [],
        bookings:
          bookingResponse.status === "fulfilled" &&
          bookingResponse.value.data?.data?.bookings
            ? bookingResponse.value.data.data.bookings
            : [],
        pages: matchedPages,
      };

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to perform search");
      setResults({ menus: [], bookings: [], pages: [] });
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    return (
      results.menus.length + results.bookings.length + results.pages.length
    );
  };

  const renderMenuResults = () => (
    <div className="space-y-3 sm:space-y-4">
      {results.menus.map((menu) => (
        <motion.div
          key={menu._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {menu.date
                  ? new Date(menu.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Menu"}
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {menu.meals?.map((meal, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600"
                  >
                    <span className="font-medium capitalize text-emerald-700 mb-1 sm:mb-0 sm:mr-2">
                      {meal.type}:
                    </span>
                    <span className="line-clamp-2">
                      {meal.items?.join(", ") || "No items"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-4 flex sm:flex-col items-center sm:text-right">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{menu.rating || 0}/5</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBookingResults = () => (
    <div className="space-y-3 sm:space-y-4">
      {results.bookings.map((booking) => (
        <motion.div
          key={booking._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 mb-3 sm:mb-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Booking #{booking.bookingId}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1.5 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span>
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="capitalize">{booking.mealType}</span>
                </div>
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>₹{booking.amount}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start sm:justify-end sm:ml-4">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderNoResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <NoSymbolIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No results found
      </h3>
      <p className="text-gray-500">
        Try searching with different keywords or check your spelling.
      </p>
    </motion.div>
  );

  const renderPageResults = () => (
    <div className="space-y-3 sm:space-y-4">
      {results.pages.map((page, index) => {
        const IconComponent = page.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={page.path}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg">
                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    {page.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {page.description}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">{page.path}</p>
                </div>
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transform rotate-180 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );

  const tabs = [
    { id: "all", name: "All", count: getTotalResults() },
    { id: "pages", name: "Pages", count: results.pages.length },
    { id: "menus", name: "Menus", count: results.menus.length },
    { id: "bookings", name: "Bookings", count: results.bookings.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          {/* Back button and title */}
          <div className="flex items-center mb-3 sm:mb-4">
            <Link
              to="/dashboard"
              className="mr-3 p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </Link>
            <MagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                Search Results
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">
                {query ? `"${query}"` : "Enter a search term"}
              </p>
            </div>
          </div>

          {/* Search Stats - Tabs */}
          {query && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 overflow-x-auto pb-2 sm:pb-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                        activeTab === tab.id
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="font-medium text-xs sm:text-sm">
                        {tab.name}
                      </span>
                      <span className="bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                  {loading
                    ? "Searching..."
                    : `${getTotalResults()} result${
                        getTotalResults() !== 1 ? "s" : ""
                      }`}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-500">Searching...</p>
          </div>
        ) : query ? (
          <div className="space-y-4 sm:space-y-6">
            {/* All Results */}
            {activeTab === "all" && (
              <>
                {results.pages.length > 0 && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                      Pages
                    </h2>
                    {renderPageResults()}
                  </div>
                )}
                {results.menus.length > 0 && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                      Menus
                    </h2>
                    {renderMenuResults()}
                  </div>
                )}
                {results.bookings.length > 0 && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                      Bookings
                    </h2>
                    {renderBookingResults()}
                  </div>
                )}
                {getTotalResults() === 0 && renderNoResults()}
              </>
            )}

            {/* Page Results */}
            {activeTab === "pages" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                  Pages
                </h2>
                {results.pages.length > 0
                  ? renderPageResults()
                  : renderNoResults()}
              </div>
            )}

            {/* Menu Results */}
            {activeTab === "menus" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                  Menus
                </h2>
                {results.menus.length > 0
                  ? renderMenuResults()
                  : renderNoResults()}
              </div>
            )}

            {/* Booking Results */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                  Bookings
                </h2>
                {results.bookings.length > 0
                  ? renderBookingResults()
                  : renderNoResults()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <MagnifyingGlassIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Start searching
            </h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">
              Use the search icon in the header to find menus, bookings, and
              more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
