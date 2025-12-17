/**
 * API client for Quran Quest backend.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import type { ApiResponse, AuthTokens } from '@/types';

// API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const REFRESH_TOKEN_KEY = 'quran_quest_refresh_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshPromise: Promise<AuthTokens | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

// Request interceptor - add auth header
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Ensure only one refresh request at a time
        if (!refreshPromise) {
          refreshPromise = refreshTokens();
        }

        const tokens = await refreshPromise;
        refreshPromise = null;

        if (tokens) {
          setAccessToken(tokens.accessToken);
          await setRefreshToken(tokens.refreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        // Refresh failed - user needs to log in again
        setAccessToken(null);
        await setRefreshToken(null);
      }
    }

    return Promise.reject(error);
  }
);

// Token refresh function
async function refreshTokens(): Promise<AuthTokens | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data ?? null;
  } catch {
    return null;
  }
}

// Generic API methods
export async function get<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.get<ApiResponse<T>>(endpoint, config);
  return response.data;
}

export async function post<T>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.post<ApiResponse<T>>(endpoint, data, config);
  return response.data;
}

export async function put<T>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.put<ApiResponse<T>>(endpoint, data, config);
  return response.data;
}

export async function del<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await apiClient.delete<ApiResponse<T>>(endpoint, config);
  return response.data;
}

// File upload with multipart form data
export async function uploadFile<T>(
  endpoint: string,
  file: {
    uri: string;
    name: string;
    type: string;
  },
  additionalData?: Record<string, string>
): Promise<ApiResponse<T>> {
  const formData = new FormData();

  // Add file
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  // Add additional data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await apiClient.post<ApiResponse<T>>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export { apiClient };

