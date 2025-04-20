/**
 * Helper utilities for admin authentication
 */

// Add credentials to requests
export const addAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  if (typeof window !== 'undefined') {
    const adminCredentials = sessionStorage.getItem('adminCredentials');
    
    if (adminCredentials) {
      return {
        ...headers,
        'Authorization': `Basic ${adminCredentials}`
      };
    }
  }
  
  return headers;
};

// Function to make authenticated fetch requests
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const authHeaders = addAuthHeader(options.headers || {});
  
  return fetch(url, {
    ...options,
    headers: authHeaders
  });
};

// Check if user is authenticated, for use in client components
export const checkAuth = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const adminCredentials = sessionStorage.getItem('adminCredentials');
  
  if (!adminCredentials) {
    return false;
  }
  
  try {
    const response = await fetch('/admin', {
      headers: {
        'Authorization': `Basic ${adminCredentials}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Logout function
export const logout = (router?: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adminCredentials');
    
    if (router) {
      router.push('/admin-login');
    } else {
      window.location.href = '/admin-login';
    }
  }
}; 