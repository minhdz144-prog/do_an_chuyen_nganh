import axiosInstance, { ApiResponse } from '../axios';
import { User } from '@/types/user';

export const authApi = {
  login: (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return axiosInstance.post('/auth/login', { email, password }) as Promise<any>;
  },

  register: (name: string, email: string, password: string, role: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return axiosInstance.post('/auth/register', { name, email, password, role }) as Promise<any>;
  },

  getMe: (): Promise<ApiResponse<{ user: User }>> => {
    return axiosInstance.get('/auth/me') as Promise<any>;
  },

  updateMe: (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    return axiosInstance.patch('/users/me', data) as Promise<any>;
  }
};
