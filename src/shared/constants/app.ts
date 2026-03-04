export const APP_CONFIG = {
  name: 'Thoryx',
  version: '1.0.0',
  apiTimeout: 30000,
  maxRetries: 3,
} as const;

export const STORAGE_KEYS = {
  USER_TOKEN: '@thoryx:user_token',
  USER_DATA: '@thoryx:user_data',
  THEME: '@thoryx:theme',
} as const;

export const API_ENDPOINTS = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    GET: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;
