// src/components/dashboard/FeedbackList.jsx
import { useState, useEffect } from 'react';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/feedback');
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'acknowledged': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      default: return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">My Feedback</h3>
        <button
          onClick={fetchFeedbacks}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {feedbacks.length > 0 ? (
        feedbacks.slice(0, 3).map((feedback) => (
          <div
            key={feedback._id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusIcon(feedback.status)}
                      <span className="ml-1 capitalize">{feedback.status}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {feedback.feedbackType} • {feedback.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <EyeIcon className="h-3 w-3" />
                  </button>
                </div>

                {/* Title */}
                {feedback.title && (
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{feedback.title}</h4>
                )}

                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(feedback.rating?.overall || 0)}
                  </div>
                  <span className="text-xs text-gray-600">
                    {feedback.rating?.overall || 0}/5
                  </span>
                </div>

                {/* Comment Preview */}
                {feedback.comment && (
                  <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                    "{feedback.comment}"
                  </p>
                )}

                {/* Admin Response Preview */}
                {feedback.adminResponse?.response && (
                  <div className="mb-2 p-1 bg-blue-50 rounded text-xs">
                    <p className="text-blue-900 font-medium">Admin Response:</p>
                    <p className="text-blue-800 line-clamp-1">
                      {feedback.adminResponse.response}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500">
                  Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No feedback submitted yet</p>
          <p className="text-xs text-gray-400 mt-1">Share your experience with us!</p>
        </div>
      )}

      {/* Show more link if there are more than 3 feedbacks */}
      {feedbacks.length > 3 && (
        <div className="text-center pt-2">
          <button
            onClick={fetchFeedbacks}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {feedbacks.length} feedbacks
          </button>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Type & Category</label>
                <p className="mt-1 text-gray-900 capitalize">
                  {selectedFeedback.feedbackType} • {selectedFeedback.category}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                    {getStatusIcon(selectedFeedback.status)}
                    <span className="ml-1 capitalize">{selectedFeedback.status}</span>
                  </span>
                </div>
              </div>

              {selectedFeedback.title && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Title</label>
                  <p className="mt-1 text-gray-900">{selectedFeedback.title}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Rating</label>
                <div className="mt-1 flex items-center">
                  {renderStars(selectedFeedback.rating?.overall || 0)}
                  <span className="ml-2 text-gray-600">
                    {selectedFeedback.rating?.overall || 0}/5
                  </span>
                </div>
              </div>

              {selectedFeedback.comment && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Comment</label>
                  <p className="mt-1 text-gray-900 italic">"{selectedFeedback.comment}"</p>
                </div>
              )}

              {selectedFeedback.adminResponse?.response && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Admin Response</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-900">{selectedFeedback.adminResponse.response}</p>
                    {selectedFeedback.adminResponse.date && (
                      <p className="text-xs text-blue-700 mt-2">
                        Responded on {new Date(selectedFeedback.adminResponse.date).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Submitted</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedFeedback.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList; 