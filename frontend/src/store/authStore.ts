import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export type UserRole = 'admin' | 'employer' | 'candidate';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  companyId?: string; // chỉ có khi role === 'employer'
  candidateProfile?: {
    skills: string[];
    yearsOfExperience: number;
    location?: string;
    resumeUrl?: string;
    bio?: string;
    educationLevel?: 'high_school' | 'college' | 'bachelor' | 'master' | 'phd';
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        // Lưu token vào cookie để middleware.ts (edge) đọc được
        Cookies.set('jwt_token', token, { expires: 7, path: '/' });
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        Cookies.remove('jwt_token', { path: '/' });
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'auth-storage',
      // Hàm này chạy trên client để khôi phục state từ local storage
    }
  )
);
