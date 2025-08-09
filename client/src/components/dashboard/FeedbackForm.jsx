// src/components/dashboard/FeedbackForm.jsx
import { useState, useEffect } from 'react';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const FeedbackForm = ({ isOpen, onClose, bookingId = null, menuItemId = null }) => {
  const [formData, setFormData] = useState({
    feedbackType: 'meal-review',
    title: '',
    comment: '',
    category: 'food-quality',
    rating: {
      overall: 0,
      taste: 0,
      quality: 0,
      service: 0,
      hygiene: 0,
      value: 0
    },
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [activeRating, setActiveRating] = useState('overall');

  const feedbackTypes = [
    { value: 'meal-review', label: 'Meal Review' },
    { value: 'service-feedback', label: 'Service Feedback' },
    { value: 'app-feedback', label: 'App Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' }
  ];

  const categories = [
    { value: 'food-quality', label: 'Food Quality' },
    { value: 'taste', label: 'Taste' },
    { value: 'service', label: 'Service' },
    { value: 'hygiene', label: 'Hygiene' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'app-experience', label: 'App Experience' },
    { value: 'other', label: 'Other' }
  ];

  const ratingAspects = [
    { key: 'overall', label: 'Overall Experience' },
    { key: 'taste', label: 'Taste' },
    { key: 'quality', label: 'Quality' },
    { key: 'service', label: 'Service' },
    { key: 'hygiene', label: 'Hygiene' },
    { key: 'value', label: 'Value for Money' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (aspect, rating) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        [aspect]: rating
      }
    }));
  };

  const renderStars = (aspect, currentRating) => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleRatingChange(aspect, index + 1)}
        className={`p-1 transition-colors ${
          index < currentRating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400`}
      >
        <StarIcon className="h-6 w-6 fill-current" />
      </button>
    ));
  };

  const validateForm = () => {
    if (!formData.comment.trim()) {
      toast.error('Please provide a comment');
      return false;
    }
    if (formData.rating.overall === 0) {
      toast.error('Please provide an overall rating');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        booking: bookingId,
        menuItem: menuItemId
      };

      await api.post('/feedback', payload);
      
      toast.success('Feedback submitted successfully!');
      onClose();
      
      // Reset form
      setFormData({
        feedbackType: 'meal-review',
        title: '',
        comment: '',
        category: 'food-quality',
        rating: {
          overall: 0,
          taste: 0,
          quality: 0,
          service: 0,
          hygiene: 0,
          value: 0
        },
        isAnonymous: false
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Submit Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Type *
            </label>
            <select
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {feedbackTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title for your feedback"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>

          {/* Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ratings *
            </label>
            <div className="space-y-4">
              {ratingAspects.map(aspect => (
                <div key={aspect.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 min-w-[120px]">
                    {aspect.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    {renderStars(aspect.key, formData.rating[aspect.key])}
                    <span className="ml-2 text-sm text-gray-500 min-w-[20px]">
                      {formData.rating[aspect.key]}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Please share your detailed feedback..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/1000 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
