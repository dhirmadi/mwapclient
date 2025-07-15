import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Debug log to ensure API client is loaded
if (import.meta.env.DEV) {
  console.log('🔧 API CLIENT: Enhanced API client with debugging loaded');
}

// Extend AxiosRequestConfig to include our metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string;
      startTime: number;
    };
  }
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Helper function to safely stringify objects for logging
const safeStringify = (obj: any, maxLength: number = 1000): string => {
  try {
    const str = JSON.stringify(obj, null, 2);
    return str.length > maxLength ? str.substring(0, maxLength) + '...[truncated]' : str;
  } catch (error) {
    return '[Unable to stringify object]';
  }
};

// Helper function to get current timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Add request interceptor to add auth token and comprehensive logging
apiClient.interceptors.request.use(
  async (config) => {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = getTimestamp();
    const token = localStorage.getItem('auth_token');
    
    // Add request ID for tracking
    config.metadata = { requestId, startTime: Date.now() };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Comprehensive request logging for development
    if (import.meta.env.DEV) {
      console.group(`🚀 API REQUEST [${requestId}] - ${timestamp}`);
      console.log('📍 Full URL:', `${config.baseURL}${config.url}`);
      console.log('🔧 Method:', config.method?.toUpperCase());
      console.log('📋 Headers:', {
        ...config.headers,
        Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'None'
      });
      
      if (config.params) {
        console.log('🔍 Query Params:', config.params);
      }
      
      if (config.data) {
        console.log('📦 Request Body:', safeStringify(config.data));
      }
      
      console.log('⚙️ Config:', {
        timeout: config.timeout,
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
        responseType: config.responseType
      });
      
      console.log('🔐 Auth Info:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'None'
      });
      
      console.log('🎯 Request ID for tracking:', requestId);
      console.log('⏰ Request will timeout after:', config.timeout, 'ms');
      console.groupEnd();
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.group('❌ REQUEST INTERCEPTOR ERROR');
      console.error('Error configuring request:', error);
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for comprehensive logging and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestId = response.config.metadata?.requestId || 'unknown';
    const startTime = response.config.metadata?.startTime || Date.now();
    const duration = Date.now() - startTime;
    const timestamp = getTimestamp();
    
    // Comprehensive response logging for development
    if (import.meta.env.DEV) {
      console.group(`✅ API RESPONSE [${requestId}] - ${timestamp} (${duration}ms)`);
      console.log('📍 URL:', `${response.config.baseURL}${response.config.url}`);
      console.log('🔧 Method:', response.config.method?.toUpperCase());
      console.log('📊 Status:', `${response.status} ${response.statusText}`);
      console.log('📋 Response Headers:', response.headers);
      console.log('📦 RAW Response Data:', response.data);
      console.log('📝 Response Data (JSON):', safeStringify(response.data));
      console.log('⏱️ Duration:', `${duration}ms`);
      console.log('🔍 Data Type:', typeof response.data);
      console.log('📏 Data Size:', JSON.stringify(response.data).length, 'characters');
      
      // Special logging for user roles response (any roles-related endpoint)
      if (response.config.url?.includes('/roles') || 
          response.config.url?.includes('/auth/me') || 
          response.config.url?.includes('/me')) {
        console.log('👤 USER/ROLES RESPONSE ANALYSIS:');
        console.log('  - Endpoint:', response.config.url);
        console.log('  - isSuperAdmin:', response.data?.isSuperAdmin);
        console.log('  - isTenantOwner:', response.data?.isTenantOwner);
        console.log('  - tenantId:', response.data?.tenantId);
        console.log('  - projectRoles:', response.data?.projectRoles);
        console.log('  - userId:', response.data?.userId);
        console.log('  - roles (nested):', response.data?.roles);
        console.log('  - user (nested):', response.data?.user);
      }
      
      console.groupEnd();
    }
    
    return response;
  },
  (error) => {
    const requestId = error.config?.metadata?.requestId || 'unknown';
    const startTime = error.config?.metadata?.startTime || Date.now();
    const duration = Date.now() - startTime;
    const timestamp = getTimestamp();
    
    // Comprehensive error logging for development
    if (import.meta.env.DEV) {
      console.group(`🚨 API ERROR [${requestId}] - ${timestamp} (${duration}ms)`);
      console.error('📍 URL:', error.config?.url ? `${error.config.baseURL}${error.config.url}` : 'Unknown');
      console.error('🔧 Method:', error.config?.method?.toUpperCase() || 'Unknown');
      console.error('❌ Error Message:', error.message);
      console.error('📊 Status:', error.response?.status || 'No Response');
      console.error('📋 Response Headers:', error.response?.headers || 'None');
      
      if (error.response?.data) {
        console.error('📦 Error Response Data:', safeStringify(error.response.data));
      }
      
      if (error.code) {
        console.error('🔢 Error Code:', error.code);
      }
      
      if (error.config) {
        console.error('⚙️ Request Config:', {
          baseURL: error.config.baseURL,
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
          headers: {
            ...error.config.headers,
            Authorization: error.config.headers?.Authorization ? 'Bearer [REDACTED]' : 'None'
          }
        });
      }
      
      console.error('🔍 Network Info:', {
        isNetworkError: !error.response,
        isTimeoutError: error.code === 'ECONNABORTED',
        isCancelledError: axios.isCancel(error),
        stack: error.stack
      });
      
      console.error('📱 Full Error Object:', error);
      console.groupEnd();
    } else {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Debug log to confirm interceptors are set up
if (import.meta.env.DEV) {
  console.log('🔧 API CLIENT: Request and response interceptors configured');
}

// Network connectivity test function
export const testNetworkConnectivity = async () => {
  const timestamp = getTimestamp();
  console.group(`🔍 NETWORK CONNECTIVITY TEST - ${timestamp}`);
  
  try {
    // Test 1: Basic fetch to the proxy endpoint
    console.log('🧪 Test 1: Testing proxy endpoint...');
    const proxyResponse = await fetch('/api/health', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Proxy test result:', {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: Object.fromEntries(proxyResponse.headers.entries())
    });
    
    // Test 2: Direct backend URL test
    console.log('🧪 Test 2: Testing direct backend URL...');
    const directResponse = await fetch('https://mwapss.shibari.photo/api/v1/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Direct backend test result:', {
      status: directResponse.status,
      statusText: directResponse.statusText,
      headers: Object.fromEntries(directResponse.headers.entries())
    });
    
    // Test 3: Using our API client
    console.log('🧪 Test 3: Testing with API client...');
    const apiResponse = await apiClient.get('/health');
    console.log('✅ API client test result:', {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      data: apiResponse.data
    });
    
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
  }
  
  console.groupEnd();
};

// Add to window for easy access in dev tools
if (import.meta.env.DEV) {
  (window as any).testNetworkConnectivity = testNetworkConnectivity;
  (window as any).apiClient = apiClient;
  console.log('🛠️ Debug tools available: window.testNetworkConnectivity(), window.apiClient');
  console.log('✅ API CLIENT: Ready for export with baseURL:', apiClient.defaults.baseURL);
}

export default apiClient;