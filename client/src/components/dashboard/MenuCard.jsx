// src/components/dashboard/MenuCard.jsx
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import Icons from "../common/Icons";

const MenuCard = ({ menu: _menu, onRefresh }) => {
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedBreakfastItems, setSelectedBreakfastItems] = useState([]); // For multiple breakfast items
  const [breakfastItemQuantities, setBreakfastItemQuantities] = useState({}); // Per-item quantities for breakfast
  const [quantity, setQuantity] = useState(1);
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
    // Reset selection and quantity when meal type changes
    setSelectedItemIndex(null);
    setSelectedBreakfastItems([]);
    setQuantity(1);
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

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Transform the daily menu array into the format we need
        const menuByType = {};
        response.data.data.forEach((menuItem) => {
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
        setTodayMenu(menuByType);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load today's menu");
    }
  };

  // Check if current meal is a combo (lunch/dinner style where all items share one price)
  const isComboMeal = (mealData) => {
    if (!mealData || !mealData.items || mealData.items.length === 0)
      return false;

    // If meal has a price and items don't have individual prices, it's a combo
    const hasIndividualPrices = mealData.items.some(
      (item) => item.price && item.price > 0
    );
    const hasMealPrice = mealData.price && mealData.price > 0;

    return hasMealPrice && !hasIndividualPrices;
  };

  // Toggle breakfast item selection (checkbox behavior)
  const toggleBreakfastItem = (index) => {
    setSelectedBreakfastItems((prev) => {
      if (prev.includes(index)) {
        // Remove quantity tracking when deselected
        const next = prev.filter((i) => i !== index);
        setBreakfastItemQuantities((q) => {
          const copy = { ...q };
          delete copy[index];
          return copy;
        });
        return next;
      } else {
        // Initialize quantity to 1 when first selected
        setBreakfastItemQuantities((q) => ({ ...q, [index]: 1 }));
        return [...prev, index];
      }
    });
  };

  const updateBreakfastItemQuantity = (index, delta) => {
    setBreakfastItemQuantities((prev) => {
      const current = prev[index] || 1;
      const next = Math.min(10, Math.max(1, current + delta));
      return { ...prev, [index]: next };
    });
  };

  // Calculate total for multiple breakfast items
  const calculateBreakfastTotal = () => {
    const mealData = todayMenu[selectedMeal];
    if (!mealData || selectedBreakfastItems.length === 0) return 0;

    return selectedBreakfastItems.reduce((total, index) => {
      const item = mealData.items[index];
      const itemPrice = item?.price || mealData.price || 0;
      const qty = breakfastItemQuantities[index] || 1;
      return total + itemPrice * qty;
    }, 0);
  };

  const handleBookMeal = async () => {
    const mealData = todayMenu[selectedMeal];
    const isCombo = isComboMeal(mealData);
    const isBreakfast = selectedMeal === "breakfast";

    // Validation
    if (isBreakfast && selectedBreakfastItems.length === 0) {
      toast.error("Please select at least one breakfast item");
      return;
    }

    if (!isCombo && !isBreakfast && selectedItemIndex === null) {
      toast.error("Please select an item to book");
      return;
    }

    setBookingLoading(true);
    try {
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

      // Handle different meal types
      let itemPrice, selectedItem, itemNames;

      if (isBreakfast) {
        // Multiple breakfast items with individual quantities
        itemPrice = calculateBreakfastTotal(); // Total aggregated price
        itemNames = selectedBreakfastItems
          .map(
            (idx) =>
              `${mealData.items[idx].name} x${
                breakfastItemQuantities[idx] || 1
              }`
          )
          .join(", ");
        selectedItem = { name: itemNames }; // For toast message only
      } else if (isCombo) {
        // Combo meal (lunch/dinner)
        itemPrice = mealData.price;
        selectedItem = {
          name: `${
            selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)
          } Thali`,
        };
      } else {
        // Single item
        selectedItem = mealData.items[selectedItemIndex];
        itemPrice = selectedItem.price || mealData.price || 80;
      }

      // For breakfast we treat quantity as 1 (per-item quantities handled separately)
      const effectiveQuantity = isBreakfast ? 1 : quantity;
      const totalPrice = itemPrice * effectiveQuantity;

      // Check wallet balance before booking
      if (walletBalance < totalPrice) {
        toast.error(
          `Insufficient balance! You have ₹${walletBalance} but need ₹${totalPrice.toFixed(
            2
          )} for ${quantity} item(s). Please recharge your wallet.`,
          { duration: 5000 }
        );
        setBookingLoading(false);
        return;
      }

      const bookingData = {
        menuItem: mealData._id,
        selectedItemIndex: isBreakfast
          ? selectedBreakfastItems[0]
          : isCombo
          ? 0
          : selectedItemIndex,
        mealType: selectedMeal,
        bookingDate: new Date().toISOString().split("T")[0],
        mealTime: mealData.time,
        quantity: effectiveQuantity, // breakfast sends 1 to avoid double charge
        specialRequests: isBreakfast ? `Items: ${itemNames}` : "",
      };

      try {
        const response = await api.post("/bookings", bookingData);

        if (response.data.success) {
          toast.success(
            `${quantity}x ${selectedItem.name} booked successfully!`
          );
          // Update wallet balance after successful booking
          setWalletBalance((prev) => prev - totalPrice);
          setSelectedItemIndex(null); // Reset selection
          setSelectedBreakfastItems([]); // Reset breakfast selections
          setBreakfastItemQuantities({});
          setQuantity(1); // Reset quantity
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
              {isComboMeal(currentMeal) ? (
                /* Combo Meal Display (Lunch/Dinner) - Not individually selectable */
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Complete Thali Includes:
                    </h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Combo Meal
                    </span>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {currentMeal.items.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <span className="text-2xl mr-2">
                            {item.icon || "🍛"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-600">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-green-300 flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Complete Thali Price:
                      </span>
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="h-6 w-6 text-green-600 mr-1" />
                        <span className="text-2xl font-bold text-green-600">
                          ₹{currentMeal.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      All items included in one meal
                    </p>
                  </div>
                </>
              ) : selectedMeal === "breakfast" ? (
                /* Breakfast Items - Multiple selection with checkboxes */
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Select Items (Multiple)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {currentMeal.items.map((item, index) => {
                      const itemPrice = item.price || currentMeal.price || 0;
                      const isAvailable = item.isAvailable !== false;
                      const isSelected = selectedBreakfastItems.includes(index);

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() =>
                            isAvailable && toggleBreakfastItem(index)
                          }
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : isAvailable
                              ? "border-gray-200 bg-gray-50 hover:border-orange-300"
                              : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className="text-3xl mr-3">
                              {item.icon || "🍛"}
                            </div>
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

                          <div className="flex items-center ml-4 space-x-4">
                            {itemPrice > 0 && (
                              <div className="flex items-center">
                                <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-1" />
                                <span className="text-lg font-bold text-green-600">
                                  ₹{itemPrice.toFixed(2)}
                                </span>
                              </div>
                            )}

                            {isSelected && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center space-x-2"
                              >
                                <button
                                  onClick={() =>
                                    updateBreakfastItemQuantity(index, -1)
                                  }
                                  disabled={
                                    (breakfastItemQuantities[index] || 1) <= 1
                                  }
                                  className={`p-1 rounded-md border text-xs font-medium transition-colors ${
                                    (breakfastItemQuantities[index] || 1) <= 1
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"
                                  }`}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {breakfastItemQuantities[index] || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    updateBreakfastItemQuantity(index, 1)
                                  }
                                  disabled={
                                    (breakfastItemQuantities[index] || 1) >= 10
                                  }
                                  className={`p-1 rounded-md border text-xs font-medium transition-colors ${
                                    (breakfastItemQuantities[index] || 1) >= 10
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            )}

                            {isAvailable && (
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircleIcon className="h-5 w-5 text-white" />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Other Individual Items - Single selection */
                <>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Select Item
                  </h3>
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
                          onClick={() =>
                            isAvailable && setSelectedItemIndex(index)
                          }
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : isAvailable
                              ? "border-gray-200 bg-gray-50 hover:border-blue-300"
                              : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className="text-3xl mr-3">
                              {item.icon || "🍛"}
                            </div>
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
                </>
              )}
            </div>

            {/* Quantity Counter - Shows when ready to book */}
            {(isComboMeal(currentMeal) ||
              (selectedMeal === "breakfast" &&
                selectedBreakfastItems.length > 0) ||
              selectedItemIndex !== null) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
              >
                {selectedMeal === "breakfast" &&
                selectedBreakfastItems.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Selected Items & Quantities:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-4">
                      {selectedBreakfastItems.map((idx) => {
                        const item = currentMeal.items[idx];
                        const qty = breakfastItemQuantities[idx] || 1;
                        return (
                          <li key={idx} className="flex justify-between">
                            <span>
                              {item.name} x{qty}
                            </span>
                            <span className="font-medium">
                              ₹
                              {(
                                (item.price || currentMeal.price || 0) * qty
                              ).toFixed(2)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {isComboMeal(currentMeal)
                          ? `Selected: Complete ${
                              selectedMeal.charAt(0).toUpperCase() +
                              selectedMeal.slice(1)
                            } Thali`
                          : `Selected: ${currentMeal.items[selectedItemIndex]?.name}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹
                        {(isComboMeal(currentMeal)
                          ? currentMeal.price
                          : currentMeal.items[selectedItemIndex]?.price ||
                            currentMeal.price ||
                            0
                        ).toFixed(2)}{" "}
                        per {isComboMeal(currentMeal) ? "thali" : "item"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className={`p-2 rounded-lg transition-all ${
                          quantity <= 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-100 border-2 border-blue-300 shadow-sm"
                        }`}
                      >
                        <MinusIcon className="h-5 w-5" />
                      </button>
                      <div className="bg-white px-6 py-2 rounded-lg border-2 border-blue-300 shadow-sm">
                        <span className="text-xl font-bold text-gray-900">
                          {quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        disabled={quantity >= 10}
                        className={`p-2 rounded-lg transition-all ${
                          quantity >= 10
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-100 border-2 border-blue-300 shadow-sm"
                        }`}
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Amount:
                  </span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {(selectedMeal === "breakfast" &&
                      selectedBreakfastItems.length > 0
                        ? calculateBreakfastTotal() // already includes per-item quantities
                        : isComboMeal(currentMeal)
                        ? currentMeal.price * quantity
                        : (currentMeal.items[selectedItemIndex]?.price ||
                            currentMeal.price ||
                            0) * quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

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
              </div>

              <button
                onClick={handleBookMeal}
                disabled={
                  bookingLoading ||
                  getMealStatus(selectedMeal) !== "available" ||
                  (selectedMeal === "breakfast" &&
                    selectedBreakfastItems.length === 0) ||
                  (!isComboMeal(currentMeal) &&
                    selectedMeal !== "breakfast" &&
                    selectedItemIndex === null)
                }
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                  getMealStatus(selectedMeal) === "available" &&
                  !bookingLoading &&
                  (isComboMeal(currentMeal) ||
                    (selectedMeal === "breakfast" &&
                      selectedBreakfastItems.length > 0) ||
                    selectedItemIndex !== null)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : selectedMeal === "breakfast" &&
                  selectedBreakfastItems.length > 0 ? (
                  <>
                    <span>
                      Book {quantity}x ({selectedBreakfastItems.length} items) -
                      ₹{(calculateBreakfastTotal() * quantity).toFixed(2)}
                    </span>
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                  </>
                ) : isComboMeal(currentMeal) ? (
                  <>
                    <span>
                      Book {quantity}x Thali - ₹
                      {(currentMeal.price * quantity).toFixed(2)}
                    </span>
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                  </>
                ) : selectedItemIndex !== null ? (
                  <>
                    <span>
                      Book {quantity}x{" "}
                      {currentMeal.items[selectedItemIndex]?.name} - ₹
                      {(
                        (currentMeal.items[selectedItemIndex]?.price ||
                          currentMeal.price ||
                          0) * quantity
                      ).toFixed(2)}
                    </span>
                    <CheckCircleIcon className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    <span>
                      Select{" "}
                      {selectedMeal === "breakfast"
                        ? "at least one item"
                        : "an item"}{" "}
                      to book
                    </span>
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
