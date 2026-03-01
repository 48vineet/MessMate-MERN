// src/utils/api.jsx
import axios from "axios";
import { toast } from "react-hot-toast";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];

const isPublicPath = (path) => PUBLIC_PATHS.includes(path);

const isPublicRequest = (url = "") => {
  const normalizedUrl = String(url);
  return (
    normalizedUrl.includes("/public/") ||
    normalizedUrl.includes("/auth/login") ||
    normalizedUrl.includes("/auth/register") ||
    normalizedUrl.includes("/auth/forgot-password") ||
    normalizedUrl.includes("/auth/reset-password")
  );
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("messmate_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      toast.error("Network error. Please check your internet connection.");
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401: {
        localStorage.removeItem("messmate_token");
        delete api.defaults.headers.common.Authorization;

        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url || "";
        const shouldStayOnPublicPage =
          isPublicPath(currentPath) || isPublicRequest(requestUrl);

        if (!shouldStayOnPublicPage) {
          toast.error("Session expired. Please login again.");
          window.location.href = "/login";
        }
        break;
      }

      case 400: {
        const message = response.data?.message;
        if (message && !response.data?.silent) {
          toast.error(message);
        }
        break;
      }

      case 403: {
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith("/admin");
        const isStudentRoute =
          currentPath.startsWith("/dashboard") ||
          currentPath.startsWith("/menu") ||
          currentPath.startsWith("/bookings") ||
          currentPath.startsWith("/wallet") ||
          currentPath.startsWith("/profile");

        if (isAdminRoute) {
          toast.error("Access denied. You do not have permission.");
        } else if (!isStudentRoute) {
          toast.error("Access denied. You do not have permission.");
        }
        break;
      }

      case 404:
        toast.error("Requested resource not found.");
        break;

      case 429:
        toast.error("Too many requests. Please try again later.");
        break;

      case 500:
        toast.error("Server error. Please try again later.");
        break;

      default: {
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
  } catch (uploadError) {
    console.error("File upload error:", uploadError);
    throw uploadError;
  }
};

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
  } catch (downloadError) {
    console.error("File download error:", downloadError);
    throw downloadError;
  }
};

export default api;
