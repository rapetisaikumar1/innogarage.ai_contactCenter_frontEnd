export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'MANAGER';
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
