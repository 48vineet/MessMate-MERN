// components/dashboard/ProfileCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Avatar } from '../ui';
import { 
  UserIcon, 
  CreditCardIcon, 
  StarIcon,
  TrophyIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

const ProfileCard = ({ user, stats = null }) => {
  const { logout } = useAuth();
  const [showFullStats, setShowFullStats] = useState(false);

  const handleEditProfile = () => {
    window.location.href = '/profile';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Avatar */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-4">
          <Avatar
            name={user?.name}
            src={user?.avatar?.url}
            size="lg"
            className="ring-4 ring-white shadow-lg"
          />
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.name}
            </h2>
            <p className="text-gray-600">
              {user?.email}
            </p>
            {user?.studentId && (
              <Badge variant="primary" className="text-xs mt-1">
                ID: {user.studentId}
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditProfile}
            leftIcon={<PencilIcon className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Wallet Balance</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = '/wallet'}
          >
            Add Money
          </Button>
        </div>
        
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(user?.wallet?.balance)}
        </div>
        
        <div className="text-sm text-gray-500 mt-1">
          Last transaction: {
            user?.wallet?.transactions?.[0] 
              ? new Date(user.wallet.transactions[0].date).toLocaleDateString()
              : 'No transactions yet'
          }
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Your Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.bookings?.total || user?.stats?.totalBookings || 0}
            </div>
            <div className="text-xs text-blue-700">Total Bookings</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.financial?.totalSpent || user?.stats?.totalSpent)}
            </div>
            <div className="text-xs text-green-700">Total Spent</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
              <StarIcon className="w-5 h-5 mr-1 fill-current" />
              {(user?.stats?.averageRating || 4.2).toFixed(1)}
            </div>
            <div className="text-xs text-yellow-700">Avg Rating</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats?.attendance?.attendancePercentage || 85}%
            </div>
            <div className="text-xs text-purple-700">Attendance</div>
          </div>
        </div>

        {/* Detailed Stats Toggle */}
        {stats && (
          <motion.div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullStats(!showFullStats)}
              className="w-full text-gray-600"
            >
              {showFullStats ? 'Show Less' : 'Show More Stats'}
            </Button>
            
            {showFullStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">{stats.bookings?.successRate || 95}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Order Value:</span>
                  <span className="font-medium">{formatCurrency(stats.financial?.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="font-medium">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">
                    {user?.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Today'
                    }
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* User Preferences */}
      {user?.preferences && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {user.preferences.dietary?.map((pref, index) => (
              <Badge key={index} variant="success" className="text-xs">
                {pref === 'vegetarian' ? '🌱 Veg' :
                 pref === 'non-vegetarian' ? '🍖 Non-Veg' :
                 pref === 'vegan' ? '🌿 Vegan' :
                 pref === 'jain' ? '🙏 Jain' : pref}
              </Badge>
            ))}
          </div>
          
          {user.preferences.allergies?.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-gray-600">Allergies: </span>
              <span className="text-sm font-medium text-red-600">
                {user.preferences.allergies.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings'}
          >
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
