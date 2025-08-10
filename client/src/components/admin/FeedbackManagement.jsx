// src/components/admin/FeedbackManagement.jsx
import { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    pendingFeedback: 0,
    resolvedFeedback: 0,
    responseRate: 0,
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, searchTerm, ratingFilter, statusFilter]);

  // Add keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "F5") {
        event.preventDefault();
        refreshData();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    console.log("Starting refresh...");
    try {
      // Try to refresh both data sources, but don't fail if one fails
      const results = await Promise.allSettled([
        fetchFeedbacks(),
        fetchStats(),
      ]);

      const feedbacksSuccess = results[0].status === "fulfilled";
      const statsSuccess = results[1].status === "fulfilled";

      if (feedbacksSuccess && statsSuccess) {
        console.log("Refresh completed successfully");
        toast.success("Data refreshed successfully");
      } else if (feedbacksSuccess) {
        console.log("Feedbacks refreshed, stats failed");
        toast.success("Feedbacks refreshed");
      } else if (statsSuccess) {
        console.log("Stats refreshed, feedbacks failed");
        toast.success("Stats refreshed");
      } else {
        console.log("Both refresh operations failed");
        toast.error("Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const createSampleFeedback = async () => {
    try {
      const sampleFeedback = {
        feedbackType: "meal-review",
        category: "food-quality",
        title: "Sample Feedback",
        comment: "This is a sample feedback for testing purposes.",
        rating: {
          overall: 4,
          taste: 4,
          presentation: 3,
          portion: 4,
          temperature: 5,
        },
        isAnonymous: false,
      };

      await api.post("/feedback", sampleFeedback);
      toast.success("Sample feedback created");
      refreshData();
    } catch (error) {
      console.error("Error creating sample feedback:", error);
      toast.error("Failed to create sample feedback");
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get("/feedback");
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/feedback/admin/stats");
      const overview = response.data.data.overview || {};
      setStats({
        totalFeedback: overview.totalFeedback || 0,
        averageRating: overview.averageRating || 0,
        pendingFeedback: overview.pendingFeedback || 0,
        resolvedFeedback: overview.resolvedFeedback || 0,
        responseRate:
          overview.totalFeedback > 0
            ? (overview.resolvedFeedback / overview.totalFeedback) * 100
            : 0,
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    }
  };

  const filterFeedbacks = () => {
    let filtered = feedbacks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (feedback) =>
          feedback.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(
        (feedback) => feedback.rating?.overall === rating
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (feedback) => feedback.status === statusFilter
      );
    }

    setFilteredFeedbacks(filtered);
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?"))
      return;

    try {
      await api.delete(`/feedback/${feedbackId}`);
      setFeedbacks((prev) =>
        prev.filter((feedback) => feedback._id !== feedbackId)
      );
      toast.success("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await api.put(`/feedback/${feedbackId}`, { status: newStatus });
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback._id === feedbackId
            ? { ...feedback, status: newStatus }
            : feedback
        )
      );
      toast.success("Feedback status updated successfully");
    } catch (error) {
      console.error("Error updating feedback status:", error);
      toast.error("Failed to update feedback status");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    if (rating >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "acknowledged":
        return "text-blue-600 bg-blue-100";
      case "in-progress":
        return "text-orange-600 bg-orange-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "closed":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback Management
          </h1>
          <p className="text-gray-600">
            Monitor and manage user feedback and ratings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageRating?.toFixed(1) || "0.0"}
                </p>
                <div className="flex items-center mt-2">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Feedbacks
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalFeedback || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingFeedback || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting response</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Response Rate
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.responseRate?.toFixed(1) || "0"}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Issues resolved</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedbacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <button
              onClick={refreshData}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                refreshing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={refreshing}
              title="Refresh data (or press F5)"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {feedbacks.length === 0 && (
              <button
                onClick={createSampleFeedback}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Create sample feedback for testing"
              >
                Create Sample Data
              </button>
            )}
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Feedbacks ({filteredFeedbacks.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {feedback.user?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {feedback.isAnonymous
                              ? "Anonymous"
                              : feedback.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {feedback.user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Feedback Type & Category */}
                      <div className="flex items-center mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            feedback.status
                          )}`}
                        >
                          {getStatusIcon(feedback.status)}
                          <span className="ml-1 capitalize">
                            {feedback.status}
                          </span>
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {feedback.feedbackType} • {feedback.category}
                        </span>
                      </div>

                      {/* Title */}
                      {feedback.title && (
                        <h3 className="font-medium text-gray-900 mb-2">
                          {feedback.title}
                        </h3>
                      )}

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-3">
                          {renderStars(feedback.rating?.overall || 0)}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(
                            feedback.rating?.overall || 0
                          )}`}
                        >
                          {feedback.rating?.overall || 0}/5
                        </span>
                      </div>

                      {/* Comment */}
                      {feedback.comment && (
                        <div className="mb-3">
                          <p className="text-gray-700 italic">
                            "{feedback.comment}"
                          </p>
                        </div>
                      )}

                      {/* Admin Response */}
                      {feedback.adminResponse?.response && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Admin Response:
                          </p>
                          <p className="text-sm text-blue-800">
                            {feedback.adminResponse.response}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500">
                        Submitted on{" "}
                        {new Date(feedback.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedFeedback(feedback)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feedback._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Feedback"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No feedbacks found</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Feedback Details
                </h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    User
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedFeedback.isAnonymous
                      ? "Anonymous"
                      : selectedFeedback.user?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedFeedback.user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Type & Category
                  </label>
                  <p className="mt-1 text-gray-900 capitalize">
                    {selectedFeedback.feedbackType} •{" "}
                    {selectedFeedback.category}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      value={selectedFeedback.status}
                      onChange={(e) =>
                        handleStatusUpdate(selectedFeedback._id, e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {selectedFeedback.title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Title
                    </label>
                    <p className="mt-1 text-gray-900">
                      {selectedFeedback.title}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Overall Rating
                  </label>
                  <div className="mt-1 flex items-center">
                    {renderStars(selectedFeedback.rating?.overall || 0)}
                    <span className="ml-2 text-gray-900">
                      {selectedFeedback.rating?.overall || 0}/5
                    </span>
                  </div>
                </div>

                {selectedFeedback.rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Detailed Ratings
                    </label>
                    <div className="space-y-2">
                      {Object.entries(selectedFeedback.rating).map(
                        ([aspect, rating]) => {
                          if (aspect === "overall") return null;
                          return (
                            <div
                              key={aspect}
                              className="flex items-center justify-between"
                            >
                              <span className="capitalize text-gray-700">
                                {aspect}
                              </span>
                              <div className="flex items-center">
                                {renderStars(rating)}
                                <span className="ml-2 text-sm text-gray-600">
                                  {rating}/5
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {selectedFeedback.comment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Comment
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 italic">
                        "{selectedFeedback.comment}"
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeedback.adminResponse?.response && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Admin Response
                    </label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-900">
                        {selectedFeedback.adminResponse.response}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Responded on{" "}
                        {new Date(
                          selectedFeedback.adminResponse.respondedAt
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Submitted
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedFeedback.createdAt).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      handleDelete(selectedFeedback._id);
                      setSelectedFeedback(null);
                    }}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
