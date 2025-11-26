// src/components/admin/AddUser.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

// Custom SVG Icons
const UserPlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    hostel: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/admin/create-user", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        hostel: formData.hostel,
        role: formData.role,
        password: formData.password,
      });

      toast.success("User created successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error creating user:", error);
      const message = error.response?.data?.message || "Failed to create user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 p-6 transition-all duration-700 ease-out">
      <div className="max-w-4xl mx-auto">
        {/* Header without Dark Mode Toggle */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={() => navigate("/admin/users")}
              aria-label="Back to Users"
              className="group flex items-center text-amber-700 hover:text-orange-600 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Back to Users</span>
            </button>
          </div>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 transition-colors duration-300">
                Add New User
              </h1>
              <p className="text-gray-600 transition-colors duration-300 mt-1">
                Create a new user account for the food ordering system
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 transition-all duration-500 transform hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="border-b border-orange-100 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                  Basic Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter the user's personal details
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                    placeholder="Enter student ID"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Hostel
                  </label>
                  <input
                    type="text"
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                    placeholder="Enter hostel name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02] cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-6">
              <div className="border-b border-orange-100 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                  Password Setup
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Set a secure password for the user account
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors duration-300">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-orange-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 ease-out transform focus:scale-[1.02]"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Match Indicator */}
              {formData.password && formData.confirmPassword && (
                <div className="mt-4 animate-fadeIn">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-3 transition-all duration-300 transform hover:scale-105">
                      <CheckCircleIcon className="w-5 h-5 mr-2 animate-bounce" />
                      <span className="text-sm font-medium">
                        Passwords match perfectly!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 rounded-lg p-3 transition-all duration-300 transform hover:scale-105">
                      <XCircleIcon className="w-5 h-5 mr-2 animate-pulse" />
                      <span className="text-sm font-medium">
                        Passwords do not match
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-orange-100">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                aria-label="Cancel"
                className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                aria-label="Create User"
                className="group relative px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out transform hover:scale-105 focus:ring-4 focus:ring-orange-500/25"
              >
                <span
                  className={`transition-opacity duration-200 ${
                    loading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Create User
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
