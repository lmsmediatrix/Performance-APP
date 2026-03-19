import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_ENDPOINTS } from "../config/endpoints";
import { getStoredAuthToken } from "../lib/authToken";

/**
 * API Client Configuration
 *
 * This file configures the global axios instance used throughout the application.
 * It includes error handling that preserves HttpOnly cookie authentication state.
 *
 * Key features:
 * - Uses withCredentials to send cookies with cross-origin requests
 * - Handles authentication errors (401/403) without automatically logging out
 * - Provides detailed error information while protecting sensitive data
 * - Transforms all errors into ApiError instances with consistent structure
 */

const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 120000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAuthToken();

    if (!token) {
      return config;
    }

    const headers = AxiosHeaders.from(config.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom error class to maintain original error properties
export class ApiError extends Error {
  code?: string;
  status?: number;
  data?: any;
  isAuthError: boolean;
  originalError: AxiosError;

  constructor(message: string, originalError: AxiosError) {
    super(message);
    this.name = "ApiError";
    this.originalError = originalError;
    this.isAuthError = false;

    // Preserve important properties from the original error
    if (originalError.code) {
      this.code = originalError.code;
    }

    if (originalError.response) {
      this.status = originalError.response.status;
      this.data = originalError.response.data;

      // Mark authentication errors specifically
      if (this.status === 401 || this.status === 403) {
        this.isAuthError = true;
      }
    }
  }
}

// Global axios interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Create a safe error object for logging that doesn't include sensitive data
      const safeErrorForLogging = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorCode: error.code,
      };

      if (error.code === "ECONNABORTED") {
        console.error("Request timeout:", safeErrorForLogging);
        return Promise.reject(
          new ApiError("Request timed out. Please try again.", error)
        );
      }

      if (error.response) {
        // Handle authentication errors specifically
        if (error.response.status === 401 || error.response.status === 403) {
          console.error("Authentication error:", safeErrorForLogging);

          // Don't log out automatically on 401/403 to prevent breaking login state
          // Just pass the error through to be handled by the component
          const errorMessage =
            (error.response.data as { error?: string })?.error ||
            (error.response.data as { message?: string })?.message ||
            "Authentication error";

          return Promise.reject(new ApiError(errorMessage, error));
        }

        // Handle other server errors
        console.error("Server error:", safeErrorForLogging);
        const errorMessage =
          (error.response.data as { error?: string })?.error ||
          (error.response.data as { message?: string })?.message ||
          "An error occurred with the server";

        return Promise.reject(new ApiError(errorMessage, error));
      }

      if (error.request) {
        // Request was made but no response received
        console.error("No response received:", safeErrorForLogging);
        return Promise.reject(
          new ApiError(
            "No response received. Please check your connection.",
            error
          )
        );
      }
    }

    // Something else happened while setting up the request
    console.error("Request error:", error.message);
    return Promise.reject(
      new ApiError("Error making request", error as AxiosError)
    );
  }
);

export default apiClient;
