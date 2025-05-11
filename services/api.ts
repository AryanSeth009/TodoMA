import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/task';
import { Platform } from 'react-native';

// Determine the correct API URL based on environment
const getApiUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'web') {
      // For web development
      return 'http://localhost:5000/api';
    }
    if (Platform.OS === 'android') {
      // For Android emulator
      return 'http://10.0.2.2:5000/api';
    }
    // For iOS
    return 'http://localhost:5000/api';
  }
  // Production environment
  return 'https://todo-app-m0dz.onrender.com/api';
};

const API_URL = getApiUrl();
console.log('Environment:', __DEV__ ? 'Development' : 'Production');
console.log('Platform:', Platform.OS);
console.log('API URL:', API_URL);

// Helper function to handle network errors
const handleNetworkError = (error: any) => {
  console.error('Network error:', error);
  if (error.message === 'Network request failed') {
    throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
  }
  throw error;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }
  return response.json();
};

// Helper function to map backend task to frontend format
const mapBackendTask = (backendTask: any): Task => {
  console.log('Mapping backend task:', backendTask);
  
  // Ensure we have a valid ID
  if (!backendTask._id && !backendTask.id) {
    console.error('Task missing ID:', backendTask);
    throw new Error('Task missing ID');
  }

  return {
    id: backendTask._id || backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    startTime: backendTask.startTime,
    endTime: backendTask.endTime,
    team: backendTask.team || [],
    progress: backendTask.progress || 0,
    color: backendTask.color || '#f8e9f0',
    daysRemaining: backendTask.daysRemaining || 7,
    categoryId: backendTask.categoryId || 'default',
    completed: backendTask.completed || false,
    completedAt: backendTask.completedAt || undefined,
    scheduled: backendTask.scheduled || false,
    createdAt: backendTask.createdAt || new Date().toISOString()
  };
};

class ApiService {
  private token: string | null = null;
  private readonly TIMEOUT_MS = 30000; // Increased timeout to 30 seconds

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('token');
      console.log('Token loaded:', this.token ? 'Present' : 'Not present');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
    try {
      console.log(`API Request: ${endpoint} (Attempt ${3 - retries} of 3)`);
      
      // Always include Content-Type header
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add authorization if token exists
      if (this.token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${this.token}`,
        };
      }
      
      // Add CORS mode
      options.mode = 'cors';
      
      const url = `${API_URL}${endpoint}`;
      console.log(`Making API Request to: ${url}`);
      console.log('Request options:', JSON.stringify(options, null, 2));

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`Request timeout after ${this.TIMEOUT_MS}ms`);
      }, this.TIMEOUT_MS);

      // Log network state
      console.log('Network state:', {
        url,
        method: options.method || 'GET',
        platform: Platform.OS,
        dev: __DEV__,
        retries,
      });

      // Log the request attempt
      console.log(`Attempting request to ${url} (${retries} retries left)`);
      console.log('Headers:', options.headers);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }
        
        console.log('Response data:', data);
      
      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data);
        throw new Error(data.error || data.message || 'Something went wrong');
      }
      
      return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('API Request failed:', error);
      
      // If we have retries left and it's a timeout or network error, retry
      if (retries > 0 && (error.name === 'AbortError' || error instanceof TypeError)) {
        console.log(`Retrying request... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.request(endpoint, options, retries - 1);
      }
      
      if (error instanceof TypeError || error.name === 'AbortError') {
        console.error('Network error details:', {
          url: `${API_URL}${endpoint}`,
          error: error.message,
          stack: error.stack
        });
        
        if (retries > 0) {
          console.log(`Network error, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request(endpoint, options, retries - 1);
        }
        
        throw new Error('Unable to connect to the server. Please check your network connection.');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after multiple attempts. Please try again.');
      }
      
      // Handle MongoDB connection errors
      if (error.message?.includes('MongoDB connection error')) {
        throw new Error('Database connection error. Please try again later.');
      }
      
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    try {
      // Validate input parameters
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email address');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password');
      }

      console.log('Attempting login for:', email);
    const data = await this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

      if (!data || !data.token) {
        throw new Error('Invalid login response: Missing token');
      }

      console.log('Login successful, received token');
    this.token = data.token;
    await AsyncStorage.setItem('token', data.token);
    return data;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.message.includes('timed out')) {
        throw new Error('Login request timed out. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  async register(email: string, password: string, username: string) {
    try {
      // Validate input parameters
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email address');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password');
      }
      if (!username || typeof username !== 'string') {
        throw new Error('Invalid username');
      }

      console.log('Attempting registration for:', email);
    const data = await this.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
    });

      if (!data || !data.token) {
        throw new Error('Invalid registration response: Missing token');
      }

      console.log('Registration successful, received token');
    this.token = data.token;
    await AsyncStorage.setItem('token', data.token);
    return data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.message.includes('timed out')) {
        throw new Error('Registration request timed out. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  async logout() {
    this.token = null;
    await AsyncStorage.removeItem('token');
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      console.log('API - Fetching tasks...');
      const apiTasks = await this.request('/tasks');
      console.log('API - Raw tasks response:', apiTasks);
      
      if (!Array.isArray(apiTasks)) {
        console.error('API - Invalid tasks response:', apiTasks);
        return [];
      }
      
      const mappedTasks = apiTasks.map(task => {
        try {
          return mapBackendTask(task);
        } catch (error) {
          console.error('API - Error mapping task:', error, task);
          return null;
        }
      }).filter((task): task is Task => task !== null);

      console.log('API - Mapped tasks:', mappedTasks);
      return mappedTasks;
    } catch (error: any) {
      console.error('API - Error getting tasks:', error);
      
      // Handle authentication errors
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        // Clear the token on auth errors
        this.token = null;
        await AsyncStorage.removeItem('token');
        throw new Error('Authentication required');
      }
      
      return [];
    }
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      console.log('API - Creating task:', task);
      const result = await this.request('/tasks', {
            method: 'POST',
        body: JSON.stringify(task),
          });
      
      console.log('API - Task creation response:', result);
      
      if (!result._id && !result.id) {
        console.error('API - Created task missing ID:', result);
        throw new Error('Task creation failed: Missing ID in response');
      }
      
      return mapBackendTask(result);
    } catch (error) {
      console.error('API - Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      // Skip API call for temporary IDs
      if (id.startsWith('temp_')) {
        console.log('API - Skipping update for temporary task:', id);
        throw new Error('Cannot update temporary task');
      }
      
      console.log('API - Updating task:', id, updates);
      const result = await this.request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      console.log('API - Task updated:', result);
      return mapBackendTask(result);
    } catch (error) {
      console.error('API - Error updating task:', error);
      // Return a mock updated task
      return {
        id,
        ...updates as any,
      };
    }
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, updates: any) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
