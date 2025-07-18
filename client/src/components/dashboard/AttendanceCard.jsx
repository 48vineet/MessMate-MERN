// src/components/dashboard/AttendanceCard.jsx
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { AnimatedCard, Badge, ProgressBar } from '../ui';

const AttendanceCard = () => {
  const attendanceData = {
    thisWeek: {
      attended: 18,
      total: 21,
      percentage: 85.7
    },
    thisMonth: {
      attended: 76,
      total: 93,
      percentage: 81.7
    },
    streak: 5
  };

  const weeklyAttendance = [
    { day: 'Mon', breakfast: true, lunch: true, dinner: true },
    { day: 'Tue', breakfast: true, lunch: false, dinner: true },
    { day: 'Wed', breakfast: true, lunch: true, dinner: true },
    { day: 'Thu', breakfast: false, lunch: true, dinner: true },
    { day: 'Fri', breakfast: true, lunch: true, dinner: true },
    { day: 'Sat', breakfast: true, lunch: true, dinner: false },
    { day: 'Sun', breakfast: true, lunch: true, dinner: true }
  ];

  const getMealIcon = (attended) => {
    return attended ? (
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Attendance Tracker</h3>
        <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-700">This Week</p>
          <p className="text-2xl font-bold text-blue-600">{attendanceData.thisWeek.percentage}%</p>
          <p className="text-xs text-blue-600">
            {attendanceData.thisWeek.attended}/{attendanceData.thisWeek.total} meals
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-700">Current Streak</p>
          <p className="text-2xl font-bold text-green-600">{attendanceData.streak}</p>
          <p className="text-xs text-green-600">consecutive days</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
          <span className="text-sm text-gray-500">
            {attendanceData.thisMonth.attended}/{attendanceData.thisMonth.total}
          </span>
        </div>
        <ProgressBar 
          value={attendanceData.thisMonth.percentage} 
          color="primary" 
          size="md"
        />
      </div>

      {/* Weekly Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">This Week</h4>
        {weeklyAttendance.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium text-gray-900 w-12">{day.day}</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {getMealIcon(day.breakfast)}
                <span className="text-xs text-gray-600">B</span>
              </div>
              <div className="flex items-center space-x-1">
                {getMealIcon(day.lunch)}
                <span className="text-xs text-gray-600">L</span>
              </div>
              <div className="flex items-center space-x-1">
                {getMealIcon(day.dinner)}
                <span className="text-xs text-gray-600">D</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement Badge */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <Badge variant="warning" className="text-sm">
          🏆 Great Attendance! Keep it up!
        </Badge>
      </motion.div>
    </AnimatedCard>
  );
};

export default AttendanceCard;
