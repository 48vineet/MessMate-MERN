// src/utils/api.jsx
import axios from "axios";
import { toast } from "react-hot-toast";

// Create axios instance with base configuration (original behavior)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("messmate_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle network errors
    if (!response) {
      toast.error("Network error. Please check your internet connection.");
      return Promise.reject(error);
    }

    // Handle different status codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("messmate_token");
        delete api.defaults.headers.common["Authorization"];

        if (window.location.pathname !== "/login") {
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
        break;

      case 403: {
        // Only show access denied for admin routes or specific cases
        // This prevents "Access denied" popups for students on student routes
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith("/admin");
        const isStudentRoute =
          currentPath.startsWith("/dashboard") ||
          currentPath.startsWith("/menu") ||
          currentPath.startsWith("/bookings") ||
          currentPath.startsWith("/wallet") ||
          currentPath.startsWith("/profile");

        // Don't show access denied for student routes - they should have access
        if (isAdminRoute) {
          toast.error("Access denied. You do not have permission.");
        } else if (!isStudentRoute) {
          // Only show for non-student routes that might legitimately deny access
          toast.error("Access denied. You do not have permission.");
        }
        // For student routes, silently handle the error without showing popup
        break;
      }

      case 404: {
        toast.error("Requested resource not found.");
        break;
      }

      case 429: {
        toast.error("Too many requests. Please try again later.");
        break;
      }

      case 500: {
        toast.error("Server error. Please try again later.");
        break;
      }

      default: {
        // Handle other errors with custom message or fallback
        const errorMessage =
          response.data?.message || "An unexpected error occurred.";
        if (!response.data?.silent) {
          toast.error(errorMessage);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (file, endpoint, onProgress = null) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

// Helper function for downloading files
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error("File download error:", error);
    throw error;
  }
};

export default api;
