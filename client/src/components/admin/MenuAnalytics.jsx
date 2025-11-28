// src/components/admin/MenuAnalytics.jsx
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const MenuAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalMenus: 0,
    totalTemplates: 0,
    averagePrice: 0,
    mostPopularMeal: "",
    totalBookings: 0,
    revenue: 0,
    monthlyTrends: [],
    mealTypeDistribution: [],
    topRatedMenus: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedDateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/analytics/menu?period=${selectedPeriod}&start=${selectedDateRange.start}&end=${selectedDateRange.end}`
      );
      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({});
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === "number" && title.includes("Price")
              ? `₹${value}`
              : typeof value === "number" && title.includes("Revenue")
              ? `₹${value.toLocaleString()}`
              : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "positive" ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : changeType === "negative" ? (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === "positive"
                    ? "text-green-600"
                    : changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Menu Analytics
              </h1>
              <p className="text-gray-600">
                Comprehensive insights into your menu performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={selectedDateRange.start}
                  onChange={(e) =>
                    setSelectedDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={selectedDateRange.end}
                  onChange={(e) =>
                    setSelectedDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Menus"
            value={analytics.totalMenus}
            icon={CalendarDaysIcon}
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Total Templates"
            value={analytics.totalTemplates}
            icon={ChartBarIcon}
            change="+5%"
            changeType="positive"
          />
          <StatCard
            title="Average Price"
            value={analytics.averagePrice}
            icon={CurrencyRupeeIcon}
            change="+8%"
            changeType="positive"
          />
          <StatCard
            title="Total Revenue"
            value={analytics.revenue}
            icon={ArrowTrendingUpIcon}
            change="+15%"
            changeType="positive"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meal Type Distribution */}
          <ChartCard title="Meal Type Distribution">
            <div className="space-y-4">
              {analytics.mealTypeDistribution.map((meal, index) => (
                <div
                  key={meal.mealType}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-3 ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-green-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {meal.mealType}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                            ? "bg-green-500"
                            : "bg-purple-500"
                        }`}
                        style={{ width: `${meal.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {meal.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Top Rated Menus */}
          <ChartCard title="Top Rated Menus">
            <div className="space-y-4">
              {analytics.topRatedMenus.map((menu, index) => (
                <div
                  key={menu.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{menu.name}</p>
                      <p className="text-sm text-gray-600">{menu.mealType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-gray-900">
                        {menu.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {menu.bookings} bookings
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    {activity.action.includes("Created") && (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    )}
                    {activity.action.includes("Updated") && (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.action.includes("Deleted") && (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.time}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default MenuAnalytics;
