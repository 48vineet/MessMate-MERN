// src/components/admin/BookingManagement.jsx
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mealFilter, setMealFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(20);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, mealFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("Fetching bookings with date filter:", dateFilter);

      // Temporarily get all bookings to see if any exist
      const response = await api.get("/bookings");
      console.log("Bookings API response:", response.data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.data.success) {
        setBookings(response.data.data);
        setTotalBookings(response.data.total);
        console.log("Set bookings:", response.data.data);
        console.log("Total bookings:", response.data.total);
        console.log("Bookings array length:", response.data.data.length);
      } else {
        console.error("API returned success: false:", response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.user?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Meal filter
    if (mealFilter !== "all") {
      filtered = filtered.filter((booking) => booking.mealType === mealFilter);
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Check if booking is already in the target status
      const booking = bookings.find((b) => b._id === bookingId);
      if (booking && booking.status === newStatus) {
        toast.info(`Booking is already ${newStatus}`);
        return;
      }

      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon },
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
      },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircleIcon },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircleIcon },
      "no-show": { color: "bg-gray-100 text-gray-800", icon: XCircleIcon },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      default:
        return "🍽️";
    }
  };

  const getCurrentPageBookings = () => {
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    return filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  };

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Booking Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage all meal bookings and reservations
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            {/* Meal Filter */}
            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>

            <button
              onClick={fetchBookings}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageBookings().map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.bookingId || booking._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-xs">
                            {booking.user?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getMealIcon(booking.mealType)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {booking.mealType}
                          </div>
                          {booking.menuItems && (
                            <div className="text-sm text-gray-500">
                              {booking.menuItems.length} items
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.mealTime || "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₹{booking.totalAmount || booking.amount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors touch-target"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "confirmed")
                              }
                              className="text-green-600 hover:text-green-900 p-2 rounded transition-colors touch-target"
                              title="Confirm Booking"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "cancelled")
                              }
                              className="text-red-600 hover:text-red-900 p-2 rounded transition-colors touch-target"
                              title="Cancel Booking"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {booking.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "completed")
                            }
                            className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors touch-target"
                            title="Mark Complete"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-100">
              {getCurrentPageBookings().map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          #{booking.bookingId || booking._id.slice(-8)}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-xs">
                            {booking.user?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {booking.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {booking.user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded transition-colors touch-target"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Meal</div>
                      <div className="flex items-center mt-1">
                        <span className="text-xl mr-2">
                          {getMealIcon(booking.mealType)}
                        </span>
                        <span className="text-sm capitalize text-gray-900">
                          {booking.mealType}
                        </span>
                      </div>
                      {booking.menuItems && (
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.menuItems.length} items
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="mt-1 text-sm text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.mealTime || "Not set"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-green-600">
                      ₹{booking.totalAmount || booking.amount || 0}
                    </div>
                    <div className="flex items-center space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "confirmed")
                            }
                            className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-target"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "cancelled")
                            }
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-target"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking._id, "completed")
                          }
                          className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing {(currentPage - 1) * bookingsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * bookingsPerPage,
                    filteredBookings.length
                  )}{" "}
                  of {filteredBookings.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 touch-target"
                  >
                    Previous
                  </button>
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 touch-target"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Booking ID
                  </label>
                  <p className="mt-1 text-gray-900">
                    #
                    {selectedBooking.bookingId || selectedBooking._id.slice(-8)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    User
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedBooking.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Meal Details
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className="text-2xl mr-2">
                      {getMealIcon(selectedBooking.mealType)}
                    </span>
                    <span className="text-gray-900 capitalize">
                      {selectedBooking.mealType}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date & Time
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedBooking.bookingDate).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  {selectedBooking.mealTime && (
                    <p className="text-sm text-gray-600">
                      {selectedBooking.mealTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    ₹
                    {selectedBooking.totalAmount || selectedBooking.amount || 0}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>

                {selectedBooking.specialInstructions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Special Instructions
                    </label>
                    <p className="mt-1 text-gray-900">
                      {selectedBooking.specialInstructions}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Booking Time
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedBooking.createdAt).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* Action Buttons */}
                {selectedBooking.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 pt-3 sm:pt-4">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, "confirmed");
                        setSelectedBooking(null);
                      }}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base touch-target"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, "cancelled");
                        setSelectedBooking(null);
                      }}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base touch-target"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {selectedBooking.status === "confirmed" && (
                  <div className="pt-3 sm:pt-4">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking._id, "completed");
                        setSelectedBooking(null);
                      }}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
