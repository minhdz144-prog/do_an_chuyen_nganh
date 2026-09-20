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
  authProvider?: 'local' | 'google';
  companyId?: string; // chỉ có khi role === 'employer'
  candidateProfile?: {
    skills: string[];
    yearsOfExperience: number;
    location?: string;
    resumeUrl?: string;
    bio?: string;
    educationLevel?: 'high_school' | 'college' | 'bachelor' | 'master' | 'phd';
  };
  savedJobs?: string[]; // ★ F.4: Bookmark jobs
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user, rememberMe = false) => {
        // ★ Remember Me: 30 ngày nếu tick, 1 ngày nếu không
        const expires = rememberMe ? 30 : 1;
        Cookies.set('jwt_token', token, { expires, path: '/' });
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
