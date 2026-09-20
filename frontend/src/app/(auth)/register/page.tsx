'use client';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Script from 'next/script';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['candidate', 'employer']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);
    
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'candidate',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res: any = await axiosInstance.post('/auth/register', data);
      login(res.token, res.data.user);
      
      if (data.role === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/candidate/profile');
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại');
    }
  };

  // ★ Google Sign Up callback
  const handleGoogleResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    try {
      const res: any = await axiosInstance.post('/auth/google', {
        credential: response.credential,
        role: watch('role'),
      });
      login(res.token, res.data.user, true);
      toast.success('Đăng ký bằng Google thành công!');
      
      if (res.data.user.role === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/candidate/profile');
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký bằng Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, router, watch]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-register-btn'),
          { 
            theme: 'filled_black', 
            size: 'large', 
            width: '100%',
            text: 'signup_with',
            shape: 'pill',
            logo_alignment: 'center',
          }
        );
      }
    };
    if ((window as any).google?.accounts) {
      initGoogle();
    } else {
      (window as any).__googleRegisterInit = initGoogle;
    }
  }, [handleGoogleResponse]);

  return (
    <>
      {GOOGLE_CLIENT_ID && (
        <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== 'undefined' && (window as any).__googleRegisterInit) {
              (window as any).__googleRegisterInit();
            }
          }}
        />
      )}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-sm">Đăng ký</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <input 
              id="name" 
              placeholder="Họ và tên"
              className={`w-full bg-transparent border-0 border-b ${errors.name ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-rose-400 px-2 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <input 
              id="email" 
              type="email" 
              placeholder="Địa chỉ email"
              className={`w-full bg-transparent border-0 border-b ${errors.email ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-rose-400 px-2 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <input 
              id="password" 
              type="password" 
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              className={`w-full bg-transparent border-0 border-b ${errors.password ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-rose-400 px-2 mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <Select 
              value={watch('role')} 
              onValueChange={(val: any) => setValue('role', val, { shouldValidate: true })}
            >
              <SelectTrigger className={`w-full bg-transparent border-0 border-b ${errors.role ? 'border-rose-400' : 'border-white/50'} rounded-none shadow-none focus:ring-0 focus:border-white focus:outline-none px-2 py-2 text-white data-[placeholder]:text-white/60 h-auto`}>
                <SelectValue placeholder="Chọn loại tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Tôi là Ứng viên</SelectItem>
                <SelectItem value="employer">Tôi là Nhà tuyển dụng</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-rose-400 px-2 mt-1">{errors.role.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 py-3.5 rounded-lg font-bold text-[15px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs uppercase tracking-wider">hoặc</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* ── Google Sign Up ── */}
        {GOOGLE_CLIENT_ID ? (
          <div id="google-register-btn" className="flex justify-center" />
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white/60 py-3 rounded-lg font-medium text-sm cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Đăng ký bằng Google (Chưa cấu hình)
          </button>
        )}
        {googleLoading && <p className="text-center text-emerald-400 text-sm mt-2">Đang xác thực với Google...</p>}

        <div className="mt-6 text-center text-sm text-white/80">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
}
