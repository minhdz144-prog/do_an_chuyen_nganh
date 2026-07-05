'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { login } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMsg('');
      const res: any = await axiosInstance.post('/auth/login', data);
      
      // API trả về: { success: true, message: string, token: string, data: { user: {...} } }
      login(res.token, res.data.user);
      
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Đăng nhập</h2>
      
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            className={errors.email ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
            className={errors.password ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-2"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
          Đăng ký ngay
        </Link>
      </div>
    </>
  );
}
