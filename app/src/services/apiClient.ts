/**
 * API Client for making HTTP requests to the backend
 */

// Base API URL - adjust based on your environment
const API_URL = import.meta.env.VITE_API_URL || 
  // Use relative path for development with Vite proxy
  (window.location.hostname === 'localhost' ? '/api' : 
  // Or absolute URL for production
  `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`);

// Also try direct connections to these ports if needed
const SERVER_PORT = 3000; // Use a single consistent port

// Function to check server availability at startup
const checkServerAvailability = async () => {
  try {
    // Try the main API endpoint
    const mainResponse = await fetch(getApiPath('/health'), {
      method: 'GET',
      credentials: 'include',
    }).catch(() => null);
    
    if (mainResponse && mainResponse.ok) {
      console.log('✅ API server is available through main URL');
      return true;
    }
    
    // Try direct connection
    const directResponse = await fetch(`http://localhost:${SERVER_PORT}/health`, {
      method: 'GET',
      credentials: 'include',
    }).catch(() => null);
    
    if (directResponse && directResponse.ok) {
      console.log(`✅ API server is available at localhost:${SERVER_PORT}`);
      return true;
    }
    
    console.warn('⚠️ Could not connect to API server - app may not work correctly');
    return false;
  } catch (error) {
    console.warn('⚠️ Error checking server availability:', error);
    return false;
  }
};

// Check connectivity when the module loads
checkServerAvailability();

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
  
  // Get tenant ID from localStorage if available
  const tenant = localStorage.getItem('userTenant');
  const tenantId = tenant ? JSON.parse(tenant).id : null;
  
  // Debug log - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`API: ${options.method || 'GET'} ${endpoint} (Tenant: ${tenantId?.substring(0, 8) || 'none'})`);
  }
  
  // Set up headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Include tenant ID in header
    ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
    ...options.headers,
  };
  
  // Also set tenant ID in cookie for server-side processing
  if (tenantId) {
    document.cookie = `tenant_id=${tenantId}; path=/; SameSite=Lax`;
  }
  
  // Full URL for the request
  const url = getApiPath(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Include credentials to ensure cookies are sent
      credentials: 'include',
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      // For debugging: log detailed information about the failed request
      if (process.env.NODE_ENV === 'development') {
        console.error(`API Error: ${response.status} for ${options.method || 'GET'} ${endpoint}`);
      }
      
      // Handle 401 Unauthorized for most endpoints - try direct server access
      if (response.status === 401 && token) {
        // This might be an issue with the proxy - try direct access
        console.log('Authentication failed with proxy. Trying direct server access...');
        const directResult = await tryDirectServerAccess(endpoint, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${token}`
          }
        });
        
        // If direct access returned an error, throw it
        if (directResult.error) {
          throw new Error(directResult.error);
        }
        
        // Otherwise return the direct result
        return directResult;
      }
      
      // Handle 404 Not Found for GET requests to specific endpoints - return empty data
      if (response.status === 404 && (options.method === undefined || options.method === 'GET')) {
        const getEndpoints = ['/ideas', '/feedback', '/customers', '/goals', '/initiatives'];
        for (const ep of getEndpoints) {
          if (endpoint === ep || endpoint.startsWith(`${ep}/`)) {
            return [];
          }
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      // Pass through the actual error message from the API if available
      const errorMessage = errorData.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // For DELETE operations that return 204 No Content or empty responses, don't try to parse JSON
    if (options.method === 'DELETE' && 
        (response.status === 204 || response.headers.get('Content-Length') === '0')) {
      return { success: true, message: 'Resource deleted successfully' };
    }
    
    // For all other successful responses, try to parse JSON
    try {
      return await response.json();
    } catch (parseError) {
      // If we can't parse JSON but the request was successful, return a success object
      console.log(`Response couldn't be parsed as JSON, but request was successful:`, parseError);
      return { success: true };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`API request failed: ${endpoint}`, error);
    }
    
    // If this is a network error, try direct server access
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Network error with proxy. Trying direct server access...');
      return tryDirectServerAccess(endpoint, options);
    }
    
    throw error;
  }
}

// Function for direct access to the server without proxy
const tryDirectServerAccess = async (endpoint: string, options: RequestInit) => {
  try {
    // Get auth token from localStorage if available
    const token = localStorage.getItem('authToken');
    
    // Get tenant ID from localStorage if available
    const tenant = localStorage.getItem('userTenant');
    const tenantId = tenant ? JSON.parse(tenant).id : null;
    
    // Prepare URL for direct access
    const directUrl = `http://localhost:${SERVER_PORT}${endpoint}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Direct API: ${options.method || 'GET'} ${directUrl}`);
    }
    
    // Prepare headers - avoiding problematic ones for CORS
    const headers = {
      'Content-Type': 'application/json',
      // Always include auth token and tenant ID in headers for direct access
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
      ...options.headers,
    };
    
    // If we have tenant ID, include it in a cookie
    if (tenantId) {
      document.cookie = `tenant_id=${tenantId}; path=/; SameSite=Lax; domain=localhost`;
    }
    
    const response = await fetch(directUrl, {
      ...options,
      headers,
      // Include credentials to ensure cookies are sent
      credentials: 'include',
    });
    
    // For DELETE operations, 404 means the resource is already gone, which is fine
    if (response.status === 404 && options.method === 'DELETE') {
      // Extract resource type from endpoint (e.g., /goals/123 -> 'goal')
      const parts = endpoint.split('/');
      // Get the resource type (removing trailing 's')
      const resourceType = parts[1].endsWith('s') 
        ? parts[1].substring(0, parts[1].length - 1) 
        : parts[1];
      
      console.log(`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} with ID ${parts[2]} not found (404), considering it already deleted`);
      
      return { 
        success: true, 
        message: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found or already deleted` 
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData: { error?: string; details?: string; message?: string } = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Not JSON, use the text as is
        errorData = { message: errorText };
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`Direct API Error: ${response.status}`, errorData);
      }
      
      return { error: errorData.error || `API error: ${response.status}`, details: errorData.details };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Direct API: Success on port ${SERVER_PORT}`);
    }
    
    return await response.json();
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Direct API: Connection failed`, error);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: 'Connection error', details: errorMessage };
  }
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

/**
 * Goals API methods
 */
export const goalsApi = {
  /**
   * Get all goals for the current tenant
   */
  getAll: async () => {
    try {
      return await fetchWithAuth('/goals');
    } catch (error) {
      console.error('Goals fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/goals', {});
    }
  },
  
  /**
   * Get a single goal by ID
   */
  getById: async (id: string) => {
    try {
      return await fetchWithAuth(`/goals/${id}`);
    } catch (error) {
      console.error('Goal fetch by ID failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/goals/${id}`, {});
    }
  },
  
  /**
   * Create a new goal
   */
  create: async (goalData: {
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    target_date?: string;
  }) => {
    try {
      return await fetchWithAuth('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      console.error('Goal creation failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    }
  },
  
  /**
   * Update an existing goal
   */
  update: async (id: string, goalData: {
    title?: string;
    description?: string;
    status?: 'active' | 'planned' | 'completed';
    target_date?: string;
  }) => {
    try {
      return await fetchWithAuth(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      console.error('Goal update failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goalData),
      });
    }
  },
  
  /**
   * Delete a goal
   */
  delete: async (id: string) => {
    try {
      // Attempt deletion via proxy API
      console.log(`Attempting to delete goal via proxy: ${id}`);
      const response = await fetchWithAuth(`/goals/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      // If we get a SyntaxError, it's likely because the server returned a 204 No Content
      // or an empty response, which is actually successful for deletion
      if (error instanceof SyntaxError) {
        console.log(`SyntaxError when deleting goal ${id}, but this is likely a successful deletion with no content returned`);
        return { success: true, message: 'Goal successfully deleted (empty response)' };
      }
      
      console.error('Goal deletion failed with proxy:', error);
      
      // For other errors, try direct server access
      try {
        console.log(`Attempting direct server access for goal deletion: ${id}`);
        const directResult = await tryDirectServerAccess(`/goals/${id}`, {
          method: 'DELETE',
        });
        
        // Check if the response indicates the goal was not found
        if (directResult && directResult.error) {
          if (directResult.error.includes('not found') || directResult.error.includes('404')) {
            console.log(`Goal ${id} not found (404), considering it already deleted`);
            return { success: true, message: "Goal not found or already deleted" };
          }
          console.error('Error from direct server access:', directResult.error);
        }
        
        return directResult;
      } catch (directError) {
        console.error('Error during direct server access:', directError);
        
        // Consider any 404 error as a successful deletion
        const errorObj = directError as { status?: number; message?: string };
        if (errorObj && 
            (errorObj.status === 404 || 
             (errorObj.message && errorObj.message.includes('404')))) {
          console.log(`Goal ${id} not found (404 from error), considering it already deleted`);
          return { success: true, message: "Goal not found or already deleted" };
        }
        
        throw directError;
      }
    }
  },
};

/**
 * Initiatives API methods
 */
export const initiativesApi = {
  /**
   * Get all initiatives for the current tenant
   */
  getAll: async () => {
    try {
      return await fetchWithAuth('/initiatives');
    } catch (error) {
      console.error('Initiatives fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/initiatives', {});
    }
  },
  
  /**
   * Get initiatives for a specific goal
   */
  getByGoalId: async (goalId: string) => {
    try {
      return await fetchWithAuth(`/goals/${goalId}/initiatives`);
    } catch (error) {
      console.error('Initiatives by goal ID fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/goals/${goalId}/initiatives`, {});
    }
  },
  
  /**
   * Get a single initiative by ID
   */
  getById: async (id: string) => {
    try {
      return await fetchWithAuth(`/initiatives/${id}`);
    } catch (error) {
      console.error('Initiative fetch by ID failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/initiatives/${id}`, {});
    }
  },
  
  /**
   * Create a new initiative
   */
  create: async (initiativeData: {
    goal_id?: string;
    title: string;
    description: string;
    status: 'active' | 'planned' | 'completed';
    priority: number;
  }) => {
    try {
      return await fetchWithAuth('/initiatives', {
        method: 'POST',
        body: JSON.stringify(initiativeData),
      });
    } catch (error) {
      console.error('Initiative creation failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/initiatives', {
        method: 'POST',
        body: JSON.stringify(initiativeData),
      });
    }
  },
  
  /**
   * Update an existing initiative
   */
  update: async (id: string, initiativeData: {
    goal_id?: string;
    title?: string;
    description?: string;
    status?: 'active' | 'planned' | 'completed';
    priority?: number;
  }) => {
    try {
      return await fetchWithAuth(`/initiatives/${id}`, {
        method: 'PUT',
        body: JSON.stringify(initiativeData),
      });
    } catch (error) {
      console.error('Initiative update failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/initiatives/${id}`, {
        method: 'PUT',
        body: JSON.stringify(initiativeData),
      });
    }
  },
  
  /**
   * Delete an initiative
   */
  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`/initiatives/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Initiative deletion failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/initiatives/${id}`, {
        method: 'DELETE',
      });
    }
  },
};

/**
 * Customers API methods 
 */
export const customersApi = {
  /**
   * Get all customers for the current tenant
   */
  getAll: async () => {
    try {
      return await fetchWithAuth('/customers');
    } catch (error) {
      console.error('Customers fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/customers', {});
    }
  },
  
  /**
   * Get a single customer by ID
   */
  getById: async (id: string) => {
    try {
      return await fetchWithAuth(`/customers/${id}`);
    } catch (error) {
      console.error('Customer fetch by ID failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/customers/${id}`, {});
    }
  },
  
  /**
   * Create a new customer
   */
  create: async (customerData: {
    name: string;
    status: 'active' | 'inactive';
    revenue?: string;
  }) => {
    try {
      console.log('Creating customer with data:', customerData);
      const response = await fetchWithAuth('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
      console.log('API response for customer creation:', response);
      return response;
    } catch (error) {
      console.error('Customer creation failed with proxy. Trying direct server access...', error);
      try {
        const directResponse = await tryDirectServerAccess('/customers', {
          method: 'POST',
          body: JSON.stringify(customerData),
        });
        console.log('Direct API response for customer creation:', directResponse);
        return directResponse;
      } catch (directError) {
        console.error('Direct server access also failed:', directError);
        throw directError;
      }
    }
  },
  
  /**
   * Update an existing customer
   */
  update: async (id: string, customerData: {
    name?: string;
    revenue?: string;
    status?: 'active' | 'inactive';
  }) => {
    try {
      return await fetchWithAuth(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
    } catch (error) {
      console.error('Customer update failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
    }
  },
  
  /**
   * Delete a customer
   */
  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`/customers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Customer deletion failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/customers/${id}`, {
        method: 'DELETE',
      });
    }
  },
};

/**
 * Feedback API methods
 */
export const feedbackApi = {
  /**
   * Get all feedback for the current tenant
   */
  getAll: async () => {
    try {
      return await fetchWithAuth('/feedback');
    } catch (error) {
      console.error('Feedback fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/feedback', {});
    }
  },
  
  /**
   * Get feedback for a specific customer
   */
  getByCustomerId: async (customerId: string) => {
    try {
      return await fetchWithAuth(`/customers/${customerId}/feedback`);
    } catch (error) {
      console.error('Feedback by customer ID fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/customers/${customerId}/feedback`, {});
    }
  },
  
  /**
   * Get a single feedback by ID
   */
  getById: async (id: string) => {
    try {
      return await fetchWithAuth(`/feedback/${id}`);
    } catch (error) {
      console.error('Feedback fetch by ID failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/feedback/${id}`, {});
    }
  },
  
  /**
   * Create a new feedback
   */
  create: async (feedbackData: {
    customer_id: string;
    content: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    source?: string;
  }) => {
    try {
      // Add title field explicitly since that's what the server validates against
      const enhancedData = {
        ...feedbackData,
        title: feedbackData.content // Copy content to title to ensure it passes validation
      };
      
      console.log('Enhanced feedback payload:', enhancedData);
      
      return await fetchWithAuth('/feedback', {
        method: 'POST',
        body: JSON.stringify(enhancedData),
      });
    } catch (error) {
      console.error('Feedback creation failed with proxy. Trying direct server access...');
      // Also ensure title is set for direct server access
      const enhancedData = {
        ...feedbackData,
        title: feedbackData.content
      };
      return tryDirectServerAccess('/feedback', {
        method: 'POST',
        body: JSON.stringify(enhancedData),
      });
    }
  },
  
  /**
   * Update an existing feedback
   */
  update: async (id: string, feedbackData: {
    content?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    source?: string;
    customer_id?: string;
    initiative_id?: string;
  }) => {
    try {
      return await fetchWithAuth(`/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify(feedbackData),
      });
    } catch (error) {
      console.error('Feedback update failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify(feedbackData),
      });
    }
  },
  
  /**
   * Delete a feedback
   */
  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`/feedback/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Feedback deletion failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/feedback/${id}`, {
        method: 'DELETE',
      });
    }
  },
};

/**
 * Ideas API methods
 */
export const ideasApi = {
  /**
   * Get all ideas for the current tenant
   */
  getAll: async () => {
    try {
      return await fetchWithAuth('/ideas');
    } catch (error) {
      console.error('Ideas fetch failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/ideas', {});
    }
  },
  
  /**
   * Get a single idea by ID
   */
  getById: async (id: string) => {
    try {
      return await fetchWithAuth(`/ideas/${id}`);
    } catch (error) {
      console.error('Idea fetch by ID failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/ideas/${id}`, {});
    }
  },
  
  /**
   * Create a new idea
   */
  create: async (ideaData: {
    title: string;
    description: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    effort?: 'xs' | 's' | 'm' | 'l' | 'xl';
    status?: 'new' | 'planned' | 'in_progress' | 'completed' | 'rejected';
    customer_ids?: string[];
    initiative_id?: string;
    source?: string;
  }) => {
    try {
      return await fetchWithAuth('/ideas', {
        method: 'POST',
        body: JSON.stringify(ideaData),
      });
    } catch (error) {
      console.error('Idea creation failed with proxy. Trying direct server access...');
      return tryDirectServerAccess('/ideas', {
        method: 'POST',
        body: JSON.stringify(ideaData),
      });
    }
  },
  
  /**
   * Update an existing idea
   */
  update: async (id: string, ideaData: {
    title?: string;
    description?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    effort?: 'xs' | 's' | 'm' | 'l' | 'xl';
    status?: 'new' | 'planned' | 'in_progress' | 'completed' | 'rejected';
    customer_ids?: string[];
    initiative_id?: string;
  }) => {
    try {
      return await fetchWithAuth(`/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ideaData),
      });
    } catch (error) {
      console.error('Idea update failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ideaData),
      });
    }
  },
  
  /**
   * Delete an idea
   */
  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`/ideas/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Idea deletion failed with proxy. Trying direct server access...');
      return tryDirectServerAccess(`/ideas/${id}`, {
        method: 'DELETE',
      });
    }
  },
};

export default {
  auth: authApi,
  goals: goalsApi,
  initiatives: initiativesApi,
  customers: customersApi,
  feedback: feedbackApi,
  ideas: ideasApi,
}; 