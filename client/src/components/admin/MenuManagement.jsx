// src/components/admin/MenuManagement.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

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
      const response = await api.get(`/menu/daily?date=${selectedDate}`);
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
      items: [...prev.items, { name: "", description: "", icon: "🍛" }],
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

    // Filter out empty items
    const validItems = formData.items.filter(
      (item) => item.name && item.name.trim() !== ""
    );

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
        console.log("Updating menu:", editingMenu._id, submitData);
        const response = await api.put(
          `/menu/daily/${editingMenu._id}`,
          submitData
        );
        toast.success("Menu updated successfully");

        const updatedMenu = response.data.data;

        // Check if the date changed
        const originalDate = new Date(editingMenu.date)
          .toISOString()
          .split("T")[0];
        const newDate = new Date(updatedMenu.date).toISOString().split("T")[0];

        console.log("Date comparison:", {
          originalDate,
          newDate,
          selectedDate,
        });

        if (originalDate !== newDate) {
          // Date changed, refetch menus for the current selected date
          console.log("Date changed, refetching menus");
          fetchMenus();
        } else {
          // Date didn't change, just update the menu in local state
          console.log("Date unchanged, updating local state");
          setMenus((prev) =>
            prev.map((menu) =>
              menu._id === editingMenu._id ? updatedMenu : menu
            )
          );
        }
      } else {
        console.log("Creating new menu:", submitData);
        const response = await api.post("/menu/daily", submitData);
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
      await api.delete(`/menu/daily/${menuId}`);
      setMenus((prev) => prev.filter((menu) => menu._id !== menuId));
      toast.success("Menu deleted successfully");
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Failed to delete menu");
    }
  };

  const handleToggleAvailability = async (menuId, isAvailable) => {
    try {
      await api.patch(`/menu/daily/${menuId}/availability`, { isAvailable });
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
      <div className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Menu Management
              </h1>
              <p className="text-gray-600">
                Create and manage daily menus for your mess
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, date: selectedDate }));
                  setShowAddMenu(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Menu
              </button>
              <button
                onClick={() => navigate("/admin/menu/templates")}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                Templates
              </button>
            </div>
          </div>
        </motion.div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getMealIcon(mealType)}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 capitalize">
                          {mealType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getMealTimeRange(mealType)}
                        </p>
                      </div>
                    </div>
                    {menu && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleAvailability(
                              menu._id,
                              !menu.isAvailable
                            )
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            menu.isAvailable
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            menu.isAvailable ? "Disable Menu" : "Enable Menu"
                          }
                        >
                          {menu.isAvailable ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : (
                            <XMarkIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Menu"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Menu"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
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
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">
                            Menu Items
                          </h4>
                          {menu.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="text-2xl mr-3">
                                {item.icon || "🍛"}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-gray-600">
                                    {item.description}
                                  </p>
                                )}
                              </div>
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
                    <div className="text-center py-8">
                      <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
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
                        className="text-blue-600 hover:text-blue-800 font-medium"
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
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMenu ? "Edit Menu" : "Add New Menu"}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Menu Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-start p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="col-span-1">
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) =>
                              handleItemChange(index, "icon", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                            placeholder="🍛"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Item name"
                            required
                          />
                        </div>
                        <div className="col-span-6">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Description (optional)"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
