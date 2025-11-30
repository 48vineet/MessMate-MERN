// src/components/admin/MenuManagement.jsx
import {
  CheckCircleIcon,
  CurrencyRupeeIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    mealType: "breakfast",
    items: [],
    price: "",
    description: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchMenus();
  }, [selectedDate]);

  const fetchMenus = async () => {
    try {
      const response = await api.get(`/menu/admin/daily?date=${selectedDate}`);
      setMenus(response.data.data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", description: "", icon: "🍛", price: "", isAvailable: true },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty items and process prices
    const validItems = formData.items
      .filter((item) => item.name && item.name.trim() !== "")
      .map((item) => ({
        ...item,
        price: item.price ? parseFloat(item.price) : undefined,
        isAvailable: item.isAvailable !== false,
      }));

    if (validItems.length === 0) {
      toast.error("Please add at least one menu item with a name");
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      items: validItems,
      price: formData.price ? parseFloat(formData.price) : undefined,
    };

    try {
      if (editingMenu) {
        const response = await api.put(
          `/menu/admin/daily/${editingMenu._id}`,
          submitData
        );
        toast.success("Menu updated successfully");

        const updatedMenu = response.data.data;

        // Check if the date changed
        const originalDate = new Date(editingMenu.date)
          .toISOString()
          .split("T")[0];
        const newDate = new Date(updatedMenu.date).toISOString().split("T")[0];

        if (originalDate !== newDate) {
          // Date changed, refetch menus for the current selected date
          fetchMenus();
        } else {
          // Date didn't change, just update the menu in local state
          setMenus((prev) =>
            prev.map((menu) =>
              menu._id === editingMenu._id ? updatedMenu : menu
            )
          );
        }
      } else {
        const response = await api.post("/menu/admin/daily", submitData);
        toast.success("Menu created successfully");

        // Add the new menu to the local state
        const newMenu = response.data.data;
        setMenus((prev) => [...prev, newMenu]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving menu:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save menu";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);

    // Format date for input field (YYYY-MM-DD)
    const formattedDate = menu.date
      ? new Date(menu.date).toISOString().split("T")[0]
      : selectedDate;

    setFormData({
      date: formattedDate,
      mealType: menu.mealType,
      items: menu.items || [],
      price: menu.price,
      description: menu.description || "",
      isAvailable: menu.isAvailable,
    });
    setShowAddMenu(true);
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;

    try {
      await api.delete(`/menu/admin/daily/${menuId}`);
      setMenus((prev) => prev.filter((menu) => menu._id !== menuId));
      toast.success("Menu deleted successfully");
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Failed to delete menu");
    }
  };

  const handleToggleAvailability = async (menuId, isAvailable) => {
    try {
      await api.patch(`/menu/admin/daily/${menuId}/availability`, {
        isAvailable,
      });
      setMenus((prev) =>
        prev.map((menu) =>
          menu._id === menuId ? { ...menu, isAvailable } : menu
        )
      );
      toast.success(
        `Menu ${isAvailable ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      console.error("Error updating menu availability:", error);
      toast.error("Failed to update menu availability");
    }
  };

  const resetForm = () => {
    setFormData({
      date: selectedDate,
      mealType: "breakfast",
      items: [],
      price: "",
      description: "",
      isAvailable: true,
    });
    setEditingMenu(null);
    setShowAddMenu(false);
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      default:
        return "🍽️";
    }
  };

  const getMealTimeRange = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "7:00 AM - 10:00 AM";
      case "lunch":
        return "12:00 PM - 3:00 PM";
      case "dinner":
        return "7:00 PM - 10:00 PM";
      default:
        return "All Day";
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 sm:p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Menu Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Create and manage daily menus for your mess
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, date: selectedDate }));
                    setShowAddMenu(true);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Add Menu
                </button>
                <button
                  onClick={() => navigate("/admin/menu/templates")}
                  className="flex-1 sm:flex-initial flex items-center justify-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base touch-target"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Templates
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {["breakfast", "lunch", "dinner"].map((mealType) => {
            const menu = menus.find((m) => m.mealType === mealType);
            return (
              <motion.div
                key={mealType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl sm:text-2xl mr-2 sm:mr-3">
                        {getMealIcon(mealType)}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                          {mealType}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {getMealTimeRange(mealType)}
                        </p>
                      </div>
                    </div>
                    {menu && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleToggleAvailability(
                              menu._id,
                              !menu.isAvailable
                            )
                          }
                          className={`p-2 rounded-lg transition-colors touch-target ${
                            menu.isAvailable
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            menu.isAvailable ? "Disable Menu" : "Enable Menu"
                          }
                        >
                          {menu.isAvailable ? (
                            <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target"
                          title="Edit Menu"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                          title="Delete Menu"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  {menu ? (
                    <div>
                      {/* Availability Status */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            menu.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {menu.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      {/* Price */}
                      {menu.price && (
                        <div className="flex items-center mb-4">
                          <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-lg font-bold text-green-600">
                            ₹{menu.price}
                          </span>
                        </div>
                      )}

                      {/* Menu Items */}
                      {menu.items && menu.items.length > 0 && (
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                            Menu Items
                          </h4>
                          {menu.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center flex-1">
                                <span className="text-xl sm:text-2xl mr-2 sm:mr-3">
                                  {item.icon || "🍛"}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm sm:text-base font-medium text-gray-900">
                                    {index + 1} {item.name}
                                  </p>
                                  {item.description && (
                                    <p className="text-sm text-gray-600">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.isAvailable === false && (
                                    <span className="text-xs text-red-600 font-medium">
                                      (Not Available)
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.price && (
                                <div className="flex items-center ml-2 sm:ml-3">
                                  <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                                  <span className="text-xs sm:text-sm font-bold text-green-600">
                                    ₹{item.price}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      {menu.description && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {menu.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <PhotoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                        No menu set for {mealType}
                      </p>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            date: selectedDate,
                            mealType,
                          }));
                          setShowAddMenu(true);
                        }}
                        className="text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium touch-target"
                      >
                        Create Menu
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add/Edit Menu Modal */}
        {showAddMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingMenu ? "Edit Menu" : "Add New Menu"}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={formData.mealType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mealType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                      min="0"
                      step="0.01"
                      placeholder="Optional: For single meal pricing"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if items have individual prices
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Menu Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm touch-target"
                    >
                      <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-1">
                            <label className="block text-xs text-gray-600 mb-1">
                              Icon
                            </label>
                            <input
                              type="text"
                              value={item.icon}
                              onChange={(e) =>
                                handleItemChange(index, "icon", e.target.value)
                              }
                              className="w-full px-2 py-2 border border-gray-300 rounded text-center bg-white"
                              placeholder="🍛"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-600 mb-1">
                              Item Name *
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(index, "name", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              placeholder="Item name"
                              required
                            />
                          </div>
                          <div className="col-span-6">
                            <label className="block text-xs text-gray-600 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              placeholder="Description (optional)"
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              value={item.price || ""}
                              onChange={(e) =>
                                handleItemChange(index, "price", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              placeholder="Leave empty to use menu price"
                              min="0"
                              step="0.01"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Optional: Leave empty to use menu-level price
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Availability
                            </label>
                            <div className="flex items-center h-10">
                              <input
                                type="checkbox"
                                checked={item.isAvailable !== false}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "isAvailable",
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                id={`item-available-${index}`}
                              />
                              <label
                                htmlFor={`item-available-${index}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                Available for booking
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                    placeholder="Special notes about this menu..."
                  />
                </div>

                {/* Availability */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAvailable: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Available for booking
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base touch-target"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 sm:py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
                  >
                    {editingMenu ? "Update Menu" : "Create Menu"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
