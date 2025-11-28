// src/pages/BookingsPage.jsx
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QrCodeIcon,
  StarIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Icons from "../components/common/Icons";
import api from "../utils/api";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    bookingDate: "",
    mealTime: "",
    quantity: 1,
    specialRequests: "",
    menuItem: "",
    selectedItemIndex: null,
  });

  useEffect(() => {
    fetchBookings();
    fetchWalletBalance();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, filterStatus, filterDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // First try to get bookings from local storage
      const localBookings = JSON.parse(
        localStorage.getItem("messmate_bookings") || "[]"
      );

      // Then try to fetch from API
      try {
        const response = await api.get("/bookings/my-bookings");
        const fetchedBookings =
          response.data.bookings || response.data.data || [];

        // Combine API bookings with local bookings
        const allBookings = [...fetchedBookings, ...localBookings];
        setBookings(allBookings);
      } catch (error) {
        console.error("Error fetching bookings from API:", error);
        // Use local bookings if API fails
        if (localBookings.length > 0) {
          setBookings(localBookings);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchBookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      // Fetch daily menus instead of regular menu items
      const response = await api.get("/menu/daily");
      console.log("Daily Menu API response:", response.data);
      setMenuItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching daily menu items:", error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get("/wallet/details");
      if (response.data?.wallet) {
        setWalletBalance(response.data.wallet.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.mealType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    // Date filter
    if (filterDate !== "all") {
      const today = new Date();

      switch (filterDate) {
        case "today": {
          filtered = filtered.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate.toDateString() === today.toDateString();
          });
          break;
        }
        case "week": {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= weekAgo;
          });
          break;
        }
        case "month": {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= monthAgo;
          });
          break;
        }
      }
    }

    setFilteredBookings(filtered);
  };

  const createBooking = async () => {
    if (!newBooking.bookingDate || !newBooking.mealTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreatingBooking(true);

      // Find the selected daily menu item
      const selectedMenuItem = menuItems.find(
        (item) => item._id === newBooking.menuItem
      );
      if (!selectedMenuItem) {
        toast.error("Please select a menu item");
        return;
      }

      // Calculate price based on selected item index or menu-level price
      let itemPrice = selectedMenuItem.price || 80;

      if (
        newBooking.selectedItemIndex !== null &&
        selectedMenuItem.items &&
        selectedMenuItem.items.length > 0
      ) {
        const selectedItem =
          selectedMenuItem.items[newBooking.selectedItemIndex];
        if (selectedItem && selectedItem.price) {
          itemPrice = selectedItem.price;
        }
      }

      const totalAmount = itemPrice * newBooking.quantity;
      const finalAmount = totalAmount;

      // Check wallet balance before booking
      if (walletBalance < finalAmount) {
        toast.error(
          `Insufficient balance! You have ₹${walletBalance} but need ₹${finalAmount}. Please recharge your wallet.`,
          { duration: 5000 }
        );
        setCreatingBooking(false);
        return;
      }

      const bookingData = {
        menuItem: newBooking.menuItem,
        selectedItemIndex: newBooking.selectedItemIndex,
        quantity: newBooking.quantity,
        mealType: selectedMenuItem.mealType,
        bookingDate: newBooking.bookingDate,
        mealTime: newBooking.mealTime,
        specialRequests: newBooking.specialRequests,
        itemPrice: itemPrice,
        totalAmount: totalAmount,
        finalAmount: finalAmount,
      };

      try {
        await api.post("/bookings", bookingData);
        toast.success("Booking created successfully!");
        // Update wallet balance after successful booking
        setWalletBalance((prev) => prev - finalAmount);
        fetchBookings();
      } catch (error) {
        console.error("Booking failed:", error);
        const errorMessage = error?.response?.data?.message || error.message;

        // Check if it's an insufficient balance error
        if (errorMessage.includes("Insufficient wallet balance")) {
          toast.error(errorMessage, { duration: 5000 });
        } else {
          toast.error(`Failed to create booking: ${errorMessage}`);
        }
        setCreatingBooking(false);
        return;
      }

      setShowNewBookingModal(false);
      resetNewBookingForm();
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setCreatingBooking(false);
    }
  };

  const resetNewBookingForm = () => {
    setNewBooking({
      bookingDate: "",
      mealTime: "",
      quantity: 1,
      specialRequests: "",
      menuItem: "",
      selectedItemIndex: null,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      booked: {
        color: "bg-green-100 text-green-800",
        text: "Booked",
        icon: CheckCircleIcon,
      },
      confirmed: {
        color: "bg-green-100 text-green-800",
        text: "Confirmed",
        icon: CheckCircleIcon,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
        icon: ClockIcon,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        text: "Cancelled",
        icon: XCircleIcon,
      },
      served: {
        color: "bg-blue-100 text-blue-800",
        text: "Served",
        icon: CheckCircleIcon,
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        text: "Completed",
        icon: CheckCircleIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: "coffee",
      lunch: "dining",
      dinner: "dining",
      snacks: "coffee",
    };
    return icons[mealType] || "dining";
  };

  // Return a JSX icon element for the given meal type
  const getMealTypeIcon = (mealType) => {
    switch ((mealType || "").toLowerCase()) {
      case "breakfast":
        return <Icons.coffee className="h-6 w-6 text-orange-600" />;
      case "lunch":
        return <Icons.dining className="h-6 w-6 text-emerald-600" />;
      case "dinner":
        return <Icons.dining className="h-6 w-6 text-purple-600" />;
      case "snacks":
        return <Icons.coffee className="h-6 w-6 text-amber-600" />;
      default:
        return <Icons.dining className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      // Try API first
      try {
        const response = await api.delete(`/bookings/${bookingId}`);
        toast.success(
          response.data.message || "Booking cancelled successfully"
        );
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error("API cancel failed:", error);

        // Show specific error message
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to cancel booking";

        // If it's a server error, show it
        if (error.response?.status === 500) {
          toast.error(`Server error: ${errorMessage}`);
          console.error("Server error details:", error.response?.data);
        } else if (error.response?.status === 403) {
          toast.error("You don't have permission to cancel this booking");
        } else if (error.response?.status === 404) {
          toast.error("Booking not found");
        } else if (error.response?.status === 400) {
          toast.error(errorMessage);
        } else {
          // Fallback to local update if API completely fails
          console.log("Attempting local update...");
          const localBookings = JSON.parse(
            localStorage.getItem("messmate_bookings") || "[]"
          );
          const updatedBookings = localBookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          );
          localStorage.setItem(
            "messmate_bookings",
            JSON.stringify(updatedBookings)
          );
          toast.success("Booking cancelled locally");
          fetchBookings();
        }
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                Manage your meal bookings and reservations
              </p>
            </div>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Booking
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="served">Served</option>
            </select>

            {/* Date Filter */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {/* Meal Type Icon */}
                      <div className="text-2xl mr-4">
                        {getMealTypeIcon(booking.mealType)}
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.mealType?.charAt(0).toUpperCase() +
                              booking.mealType?.slice(1)}{" "}
                            Booking
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                            {formatDate(booking.bookingDate)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {booking.mealTime
                              ? formatTime(booking.mealTime)
                              : "Flexible"}
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              ₹{booking.finalAmount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {booking.specialRequests && (
                          <p className="text-sm text-gray-500 mt-2">
                            Note: {booking.specialRequests}
                          </p>
                        )}

                        {/* Booking ID */}
                        <p className="text-xs text-gray-400 mt-2">
                          ID: {booking.bookingId || booking._id}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => {
                            /* Show QR code */
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Show QR Code"
                        >
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                      )}

                      {booking.status === "pending" && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}

                      {booking.status === "served" && !booking.feedback && (
                        <button
                          onClick={() => {
                            /* Show feedback form */
                          }}
                          className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm flex items-center"
                        >
                          <StarIcon className="h-4 w-4 mr-1" />
                          Rate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No bookings found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || filterStatus !== "all" || filterDate !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by creating your first booking"}
                </p>
                {!searchTerm &&
                  filterStatus === "all" &&
                  filterDate === "all" && (
                    <button
                      onClick={() => setShowNewBookingModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Booking
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      <AnimatePresence>
        {showNewBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Create New Booking
                  </h2>
                  <button
                    onClick={() => setShowNewBookingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Wallet Balance Display */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">
                          Wallet Balance
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          ₹{walletBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {walletBalance < 50 && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Low Balance
                      </div>
                    )}
                  </div>
                  {walletBalance === 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Please recharge your wallet before booking meals.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Menu Item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Item *
                    </label>
                    <select
                      value={newBooking.menuItem}
                      onChange={(e) => {
                        setNewBooking({
                          ...newBooking,
                          menuItem: e.target.value,
                          selectedItemIndex: null, // Reset item selection when menu changes
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a menu item</option>
                      {menuItems.length === 0 ? (
                        <option value="" disabled>
                          Loading menu items...
                        </option>
                      ) : (
                        menuItems.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name || `${item.mealType} Menu`} -{" "}
                            {item.mealType} - ₹{item.price || 80}
                          </option>
                        ))
                      )}
                    </select>
                    {menuItems.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        No menu items available. Please try refreshing the page.
                      </p>
                    )}
                  </div>

                  {/* Individual Items Selection - Show if selected menu has items array */}
                  {newBooking.menuItem &&
                    (() => {
                      const selectedMenu = menuItems.find(
                        (m) => m._id === newBooking.menuItem
                      );
                      return (
                        selectedMenu?.items &&
                        selectedMenu.items.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Specific Item{" "}
                              {selectedMenu.items.some((item) => item.price) &&
                                "*"}
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                              {selectedMenu.items.map((item, index) => (
                                <label
                                  key={index}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    newBooking.selectedItemIndex === index
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300 bg-white"
                                  } ${
                                    item.isAvailable === false
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      name="menuItemSelection"
                                      checked={
                                        newBooking.selectedItemIndex === index
                                      }
                                      onChange={() => {
                                        if (item.isAvailable !== false) {
                                          setNewBooking({
                                            ...newBooking,
                                            selectedItemIndex: index,
                                          });
                                        }
                                      }}
                                      disabled={item.isAvailable === false}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-900">
                                      {item.icon} {item.name}
                                      {item.isAvailable === false && (
                                        <span className="ml-2 text-xs text-red-600">
                                          (Not Available)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  {item.price && (
                                    <span className="text-sm font-bold text-green-600">
                                      ₹{item.price}
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedMenu.items.some((item) => item.price)
                                ? "Please select a specific item to continue"
                                : "All items have the same price"}
                            </p>
                          </div>
                        )
                      );
                    })()}

                  {/* Booking Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      value={newBooking.bookingDate}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          bookingDate: e.target.value,
                        })
                      }
                      min={getMinDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Meal Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Time *
                    </label>
                    <input
                      type="time"
                      value={newBooking.mealTime}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          mealTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newBooking.quantity}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      value={newBooking.specialRequests}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          specialRequests: e.target.value,
                        })
                      }
                      rows="3"
                      placeholder="Any special requests or dietary preferences..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewBookingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createBooking}
                    disabled={creatingBooking}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingBooking ? "Creating..." : "Create Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsPage;
