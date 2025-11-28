// src/components/dashboard/MenuCard.jsx
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import Icons from "../common/Icons";

const MenuCard = ({ menu, onRefresh }) => {
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayMenu, setTodayMenu] = useState({
    breakfast: {
      items: [],
      price: 0,
      available: true,
      time: "7:00 AM - 10:00 AM",
    },
    lunch: { items: [], price: 0, available: true, time: "12:00 PM - 3:00 PM" },
    dinner: {
      items: [],
      price: 0,
      available: true,
      time: "7:00 PM - 10:00 PM",
    },
  });

  useEffect(() => {
    // Fetch wallet balance
    fetchWalletBalance();

    // Safe menu initialization with null checking
    if (menu && typeof menu === "object" && Object.keys(menu).length > 0) {
      setTodayMenu(menu);
    } else {
      fetchTodayMenu();
    }
  }, [menu]);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get("/wallet/details");
      if (response.data?.wallet) {
        setWalletBalance(response.data.wallet.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchTodayMenu = async () => {
    try {
      const response = await api.get("/menu/today");
      // Ensure we have a valid object before setting
      if (response.data?.menu && typeof response.data.menu === "object") {
        setTodayMenu(response.data.menu);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load today's menu");
    }
  };

  const handleBookMeal = async (mealType) => {
    setBookingLoading(true);
    try {
      // Create a booking with the current meal data
      const mealData = todayMenu[mealType];
      const mealPrice = mealData.price || 80;

      // Check wallet balance before booking
      if (walletBalance < mealPrice) {
        toast.error(
          `Insufficient balance! You have ₹${walletBalance} but need ₹${mealPrice}. Please recharge your wallet.`,
          { duration: 5000 }
        );
        setBookingLoading(false);
        return;
      }

      const bookingData = {
        mealType: mealType,
        bookingDate: new Date().toISOString().split("T")[0],
        mealTime: `${mealType} time`,
        totalAmount: mealPrice,
        quantity: 1,
        specialRequests: "",
        status: "booked",
      };

      try {
        const response = await api.post("/bookings", bookingData);

        if (response.data.success) {
          toast.success(`${mealType} booked successfully!`);
          // Update wallet balance after successful booking
          setWalletBalance((prev) => prev - mealPrice);
          onRefresh && onRefresh();
        } else {
          throw new Error(response.data.message || "Booking failed");
        }
      } catch (error) {
        console.error("Booking error:", error);
        const errorMessage = error?.response?.data?.message || error.message;

        // Check if it's an insufficient balance error
        if (errorMessage.includes("Insufficient wallet balance")) {
          toast.error(errorMessage, { duration: 5000 });
        } else {
          toast.error(`Failed to book ${mealType}: ${errorMessage}`);
        }
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case "breakfast":
        return <Icons.coffee className="h-6 w-6" />;
      case "lunch":
        return <Icons.dining className="h-6 w-6" />;
      case "dinner":
        return <Icons.dining className="h-6 w-6" />;
      default:
        return <Icons.dining className="h-6 w-6" />;
    }
  };

  const getMealStatus = (mealType) => {
    // Check if there are actual menu items for this meal type
    const mealData = todayMenu && todayMenu[mealType];
    const hasMenuItems =
      mealData && mealData.items && mealData.items.length > 0;

    if (!hasMenuItems) {
      return "closed";
    }

    // Use the availability setting from the backend
    // This comes from the admin's settings when creating menu items
    return mealData.available ? "available" : "closed";
  };

  // **FIXED: Safe Object.keys() call with null checking**
  const mealTabs =
    todayMenu && typeof todayMenu === "object"
      ? Object.keys(todayMenu)
      : ["breakfast", "lunch", "dinner"];

  // **FIXED: Safe currentMeal access with fallback**
  const currentMeal = (todayMenu && todayMenu[selectedMeal]) || {
    items: [],
    price: 0,
    available: true,
    time: "Not available",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Menu</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDaysIcon className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Meal Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {mealTabs.map((mealType) => (
            <button
              key={mealType}
              onClick={() => setSelectedMeal(mealType)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedMeal === mealType
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="mr-2">{getMealIcon(mealType)}</span>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentMeal.items && currentMeal.items.length > 0 ? (
          <>
            {/* Meal Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {currentMeal.time}
                </span>
              </div>
              <div className="flex items-center">
                <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-1" />
                <span className="text-lg font-bold text-green-600">
                  ₹{currentMeal.price || 0}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Menu Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMeal.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl mr-3">{item.icon || "🍛"}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.rating && (
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {item.rating}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Booking Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    getMealStatus(selectedMeal) === "available"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    getMealStatus(selectedMeal) === "available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {getMealStatus(selectedMeal) === "available"
                    ? "Available Now"
                    : "Closed"}
                </span>
              </div>

              <button
                onClick={() => handleBookMeal(selectedMeal)}
                disabled={
                  bookingLoading || getMealStatus(selectedMeal) !== "available"
                }
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                  getMealStatus(selectedMeal) === "available" && !bookingLoading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <span>Book {selectedMeal}</span>
                    <CheckCircleIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* No Menu Available */
          <div className="text-center py-12">
            <Icons.dining className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Menu Available
            </h3>
            <p className="text-gray-600">
              The menu for {selectedMeal} is not available today.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MenuCard;
