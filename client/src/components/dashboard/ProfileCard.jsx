// src/components/dashboard/ProfileCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ user }) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    hostel: user?.hostel || '',
    roomNumber: user?.roomNumber || '',
    college: user?.college || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      hostel: user?.hostel || '',
      roomNumber: user?.roomNumber || '',
      college: user?.college || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      hostel: user?.hostel || '',
      roomNumber: user?.roomNumber || '',
      college: user?.college || ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getMembershipBadge = () => {
    const joinDate = new Date(user?.createdAt);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + now.getMonth() - joinDate.getMonth();
    
    if (monthsDiff < 1) return { label: 'New Member', color: 'bg-blue-100 text-blue-800' };
    if (monthsDiff < 6) return { label: 'Regular Member', color: 'bg-green-100 text-green-800' };
    if (monthsDiff < 12) return { label: 'Senior Member', color: 'bg-purple-100 text-purple-800' };
    return { label: 'Gold Member', color: 'bg-yellow-100 text-yellow-800' };
  };

  const membershipBadge = getMembershipBadge();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Profile</h3>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Avatar and Basic Info */}
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{user?.name || 'User'}</h4>
            <p className="text-xs text-gray-600">{user?.role === 'admin' ? 'Admin' : 'Student'}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-600">
            <EnvelopeIcon className="h-3 w-3 mr-2 text-gray-400" />
            <span className="truncate">{user?.email || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
            <span>{user?.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <AcademicCapIcon className="h-3 w-3 mr-2 text-gray-400" />
            <span>{user?.college || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <MapPinIcon className="h-3 w-3 mr-2 text-gray-400" />
            <span>{user?.hostel || 'Not provided'}</span>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
