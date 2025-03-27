/**
 * API Client for making HTTP requests to the backend
 */

// Base API URL - adjust based on your environment
const API_URL = import.meta.env.VITE_API_URL || 
  // Use relative path for development with Vite proxy
  (window.location.hostname === 'localhost' ? '/api' : 
  // Or absolute URL for production
  `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`);

console.log('API_URL configured as:', API_URL);

// Function to handle the API path with or without /api prefix
const getApiPath = (endpoint: string) => {
  // If API_URL already includes /api, don't include it in the endpoint
  if (API_URL.endsWith('/api')) {
    return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  
  // Otherwise, use the full path with /api
  return `${API_URL}${API_URL.endsWith('/') ? '' : '/'}${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
};

/**
 * Generic fetch wrapper with error handling and authorization
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Get auth token from localStorage if available
  const token = localStorage.getItem('authToken');
  
  // Set up headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  // Full URL for the request
  const url = getApiPath(endpoint);
  
  console.log(`Making API request to: ${url}`, {
    method: options.method || 'GET',
    headers,
    data: options.body ? JSON.parse(options.body as string) : undefined
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Pass through the actual error message from the API if available
      const errorMessage = errorData.error || `API error: ${response.status}`;
      console.error(`API error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Function for direct access to the server without proxy
const tryDirectServerAccess = async (endpoint: string, options: RequestInit) => {
  // Try different ports that the server might be running on
  const possiblePorts = [3000, 5000];
  let lastError = null;
  
  for (const port of possiblePorts) {
    try {
      const directUrl = `http://localhost:${port}${endpoint}`;
      console.log(`Trying direct server access at: ${directUrl}`);
      
      const response = await fetch(directUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      console.log(`Successfully connected to server on port ${port}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to connect on port ${port}:`, error);
      lastError = error;
    }
  }
  
  // If all attempts fail, throw the last error
  throw lastError;
};

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (userData: { email: string; password: string; name: string }) => {
    try {
      return await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Registration failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
  },
  
  /**
   * Login a user
   */
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      console.error('Login failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }
  },
  
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return await fetchWithAuth('/auth/me');
  },
  
  /**
   * Change user password
   */
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },
  
  /**
   * Request password reset
   */
  forgotPassword: async (email: string) => {
    return await fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  /**
   * Reset password with token
   */
  resetPassword: async (resetData: { token: string; newPassword: string }) => {
    return await fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  },
};

export default {
  auth: authApi,
  // Add other API modules here (users, tenants, etc.)
}; 