import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const MenuPage = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  // Fetch real menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu/daily");
        const data = await response.json();
        if (data.success) {
          setMenuItems(data.menus || []);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenuItems();
  }, []);

  const handleBooking = async () => {
    if (!selectedDate || !selectedMeal) {
      toast.error("Please select both date and meal type");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Successfully booked ${selectedMeal} for ${selectedDate}`);
      setSelectedDate("");
      setSelectedMeal("");
    } catch {
      toast.error("Failed to book meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Meal
          </h1>
          <p className="text-gray-600">Select your preferred meal and date</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Book Meal
            </h2>

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  max={maxDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Meal Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Meal
                </label>
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a meal</option>
                  {menuItems.map((meal) => (
                    <option key={meal.id} value={meal.name}>
                      {meal.name} - ₹{meal.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={loading || !selectedDate || !selectedMeal}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  "Book Meal"
                )}
              </button>
            </div>
          </motion.div>

          {/* Menu Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Today's Menu
            </h2>

            <div className="space-y-4">
              {menuItems.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {meal.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        ₹{meal.price}
                      </span>
                      {meal.available ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {meal.time}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Items:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {meal.items.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="bg-gray-100 px-2 py-1 rounded text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
