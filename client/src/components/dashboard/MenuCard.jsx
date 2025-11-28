// src/components/dashboard/MenuCard.jsx
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import Icons from "../common/Icons";

const MenuCard = ({ menu, onRefresh }) => {
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayMenu, setTodayMenu] = useState({});

  useEffect(() => {
    // Fetch wallet balance
    fetchWalletBalance();

    // Always fetch fresh menu data
    fetchTodayMenu();
  }, []);

  useEffect(() => {
    // Reset selection when meal type changes
    setSelectedItemIndex(null);
  }, [selectedMeal]);

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
      const today = new Date().toISOString().split("T")[0];
      const response = await api.get(`/menu/daily?date=${today}`);
      console.log("Fetched daily menu:", response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Transform the daily menu array into the format we need
        const menuByType = {};
        response.data.data.forEach((menuItem) => {
          console.log("Processing menu item:", {
            id: menuItem._id,
            mealType: menuItem.mealType,
          });
          menuByType[menuItem.mealType] = {
            _id: menuItem._id,
            items: menuItem.items || [],
            price: menuItem.price,
            available: menuItem.isAvailable,
            time:
              menuItem.mealType === "breakfast"
                ? "7:00 AM - 10:00 AM"
                : menuItem.mealType === "lunch"
                ? "12:00 PM - 3:00 PM"
                : "7:00 PM - 10:00 PM",
          };
        });
        console.log("Transformed menu by type:", menuByType);
        setTodayMenu(menuByType);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load today's menu");
    }
  };

  const handleBookMeal = async () => {
    if (selectedItemIndex === null) {
      toast.error("Please select an item to book");
      return;
    }

    setBookingLoading(true);
    try {
      const mealData = todayMenu[selectedMeal];

      if (!mealData || !mealData._id) {
        toast.error("Menu data not available. Please refresh the page.");
        console.error("Menu data missing:", {
          mealData,
          selectedMeal,
          todayMenu,
        });
        setBookingLoading(false);
        return;
      }

      const selectedItem = mealData.items[selectedItemIndex];

      // Determine the price - use item price if available, otherwise menu price
      const itemPrice = selectedItem.price || mealData.price || 80;

      // Check wallet balance before booking
      if (walletBalance < itemPrice) {
        toast.error(
          `Insufficient balance! You have ₹${walletBalance} but need ₹${itemPrice}. Please recharge your wallet.`,
          { duration: 5000 }
        );
        setBookingLoading(false);
        return;
      }

      const bookingData = {
        menuItem: mealData._id,
        selectedItemIndex: selectedItemIndex,
        mealType: selectedMeal,
        bookingDate: new Date().toISOString().split("T")[0],
        mealTime: mealData.time,
        quantity: 1,
        specialRequests: "",
      };

      console.log("Sending booking data:", bookingData);

      try {
        const response = await api.post("/bookings", bookingData);

        if (response.data.success) {
          toast.success(`${selectedItem.name} booked successfully!`);
          // Update wallet balance after successful booking
          setWalletBalance((prev) => prev - itemPrice);
          setSelectedItemIndex(null); // Reset selection
          onRefresh && onRefresh();
        } else {
          throw new Error(response.data.message || "Booking failed");
        }
      } catch (error) {
        console.error("Booking error:", error);
        const errorMessage = error?.response?.data?.message || error.message;

        if (errorMessage.includes("Insufficient wallet balance")) {
          toast.error(errorMessage, { duration: 5000 });
        } else {
          toast.error(`Failed to book: ${errorMessage}`);
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
        {!todayMenu[selectedMeal] || !todayMenu[selectedMeal]._id ? (
          /* Loading or No Menu */
          <div className="text-center py-12">
            <Icons.dining className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Menu...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch today's menu for {selectedMeal}.
            </p>
          </div>
        ) : currentMeal.items && currentMeal.items.length > 0 ? (
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
              <div className="grid grid-cols-1 gap-3">
                {currentMeal.items.map((item, index) => {
                  const itemPrice = item.price || currentMeal.price || 0;
                  const isAvailable = item.isAvailable !== false;
                  const isSelected = selectedItemIndex === index;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => isAvailable && setSelectedItemIndex(index)}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : isAvailable
                          ? "border-gray-200 bg-gray-50 hover:border-blue-300"
                          : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <div className="text-3xl mr-3">{item.icon || "🍛"}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-600">
                              {item.description}
                            </p>
                          )}
                          {!isAvailable && (
                            <span className="text-xs text-red-600 font-medium">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center ml-4">
                        {itemPrice > 0 && (
                          <div className="flex items-center mr-4">
                            <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-1" />
                            <span className="text-lg font-bold text-green-600">
                              ₹{itemPrice}
                            </span>
                          </div>
                        )}

                        {isAvailable && (
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircleIcon className="h-4 w-4 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Booking Button */}
            <div className="space-y-3">
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

                {selectedItemIndex !== null && (
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <div className="flex items-center">
                      <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        ₹
                        {currentMeal.items[selectedItemIndex]?.price ||
                          currentMeal.price ||
                          0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookMeal}
                disabled={
                  bookingLoading ||
                  getMealStatus(selectedMeal) !== "available" ||
                  selectedItemIndex === null
                }
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                  getMealStatus(selectedMeal) === "available" &&
                  !bookingLoading &&
                  selectedItemIndex !== null
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : selectedItemIndex !== null ? (
                  <>
                    <span>
                      Book {currentMeal.items[selectedItemIndex]?.name}
                    </span>
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    <span>Select an item to book</span>
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
