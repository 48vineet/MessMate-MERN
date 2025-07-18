// src/components/admin/FeedbackManagement.jsx
import { motion } from 'framer-motion';
import { 
  StarIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  AnimatedCard, 
  Button, 
  Badge, 
  Avatar,
  Input,
  Modal,
  ProgressBar
} from '../ui';
import { useState } from 'react';

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const feedbackData = [
    {
      id: 1,
      userId: 'USR001',
      userName: 'John Doe',
      rating: 5,
      comment: 'Excellent food quality! The dal rice was perfectly cooked and very tasty.',
      meal: 'Dal Rice',
      mealType: 'Lunch',
      date: '2025-07-17',
      status: 'pending',
      helpfulVotes: 12,
      category: 'food_quality'
    },
    {
      id: 2,
      userId: 'USR002',
      userName: 'Jane Smith',
      rating: 2,
      comment: 'Food was cold when served. Service needs improvement.',
      meal: 'Roti Sabzi',
      mealType: 'Dinner',
      date: '2025-07-16',
      status: 'responded',
      helpfulVotes: 8,
      category: 'service'
    },
    {
      id: 3,
      userId: 'USR003',
      userName: 'Mike Johnson',
      rating: 4,
      comment: 'Good taste but portion size could be bigger.',
      meal: 'Poha',
      mealType: 'Breakfast',
      date: '2025-07-17',
      status: 'pending',
      helpfulVotes: 5,
      category: 'portion_size'
    },
    {
      id: 4,
      userId: 'USR004',
      userName: 'Sarah Wilson',
      rating: 1,
      comment: 'Found a hair in my food. Very disappointed with hygiene standards.',
      meal: 'Rajma Chawal',
      mealType: 'Lunch',
      date: '2025-07-15',
      status: 'urgent',
      helpfulVotes: 15,
      category: 'hygiene'
    },
    {
      id: 5,
      userId: 'USR005',
      userName: 'Alex Brown',
      rating: 5,
      comment: 'Amazing breakfast! Quick service and fresh ingredients.',
      meal: 'Idli Sambhar',
      mealType: 'Breakfast',
      date: '2025-07-17',
      status: 'responded',
      helpfulVotes: 6,
      category: 'food_quality'
    }
  ];

  const ratingStats = [
    { rating: 5, count: 45, percentage: 60 },
    { rating: 4, count: 20, percentage: 27 },
    { rating: 3, count: 8, percentage: 11 },
    { rating: 2, count: 1, percentage: 1 },
    { rating: 1, count: 1, percentage: 1 }
  ];

  const categoryStats = [
    { category: 'food_quality', count: 25, label: 'Food Quality' },
    { category: 'service', count: 18, label: 'Service' },
    { category: 'portion_size', count: 12, label: 'Portion Size' },
    { category: 'hygiene', count: 8, label: 'Hygiene' },
    { category: 'pricing', count: 5, label: 'Pricing' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'responded': return 'success';
      case 'urgent': return 'danger';
      default: return 'gray';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesSearch = feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.meal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = selectedRating === 'all' || feedback.rating.toString() === selectedRating;
    return matchesSearch && matchesRating;
  });

  const handleRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setIsResponseModalOpen(true);
  };

  const averageRating = (ratingStats.reduce((sum, stat) => sum + (stat.rating * stat.count), 0) / 
                        ratingStats.reduce((sum, stat) => sum + stat.count, 0)).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h1>
              <p className="text-gray-600">Monitor and respond to customer feedback</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" leftIcon={<CalendarDaysIcon className="h-4 w-4" />}>
                Export Report
              </Button>
              <Button variant="primary" leftIcon={<ChatBubbleLeftIcon className="h-4 w-4" />}>
                Send Survey
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AnimatedCard className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 mr-4">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.1} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 mr-4">
                <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{feedbackData.length}</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-500 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbackData.filter(f => f.status === 'pending').length}
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-500 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbackData.filter(f => f.status === 'urgent').length}
                </p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <AnimatedCard delay={0.4} className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {ratingStats.map((stat, index) => (
                <motion.div
                  key={stat.rating}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex items-center w-16">
                    <span className="text-sm font-medium mr-2">{stat.rating}</span>
                    <StarIcon className={`h-4 w-4 ${getRatingColor(stat.rating)}`} />
                  </div>
                  <div className="flex-1">
                    <ProgressBar 
                      value={stat.percentage} 
                      color={stat.rating >= 4 ? 'success' : stat.rating >= 3 ? 'warning' : 'danger'}
                      size="sm"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{stat.count}</span>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Category Breakdown */}
          <AnimatedCard delay={0.5} className="p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback Categories</h3>
            <div className="space-y-3">
              {categoryStats.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{category.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20">
                      <ProgressBar 
                        value={(category.count / feedbackData.length) * 100} 
                        color="primary"
                        size="sm"
                      />
                    </div>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Search and Filter */}
        <AnimatedCard delay={0.6} className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </AnimatedCard>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((feedback, index) => (
            <AnimatedCard key={feedback.id} delay={0.7 + index * 0.1} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Avatar name={feedback.userName} size="sm" className="mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{feedback.userName}</h4>
                    <p className="text-sm text-gray-600">{feedback.meal} • {feedback.mealType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <Badge variant={getStatusColor(feedback.status)}>
                    {feedback.status}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{feedback.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{feedback.date}</span>
                  <div className="flex items-center">
                    <HandThumbUpIcon className="h-4 w-4 mr-1" />
                    <span>{feedback.helpfulVotes} helpful</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {feedback.status === 'urgent' && (
                    <Button variant="danger" size="sm">
                      Priority Response
                    </Button>
                  )}
                  {feedback.status === 'pending' && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleRespond(feedback)}
                    >
                      Respond
                    </Button>
                  )}
                  {feedback.status === 'responded' && (
                    <Button variant="outline" size="sm">
                      View Response
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Response Modal */}
        <Modal
          isOpen={isResponseModalOpen}
          onClose={() => setIsResponseModalOpen(false)}
          title="Respond to Feedback"
          size="md"
        >
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedFeedback.userName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{selectedFeedback.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Write your response..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsResponseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FeedbackManagement;
