'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['candidate', 'employer']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  
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
      setErrorMsg('');
      const res: any = await axiosInstance.post('/auth/register', data);
      
      // Đăng ký xong server backend tự động trả về token (giống login)
      login(res.token, res.data.user);
      
      // Điều hướng dựa theo role
      if (data.role === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/candidate/profile');
      }
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || 'Đăng ký thất bại');
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Đăng ký tài khoản</h2>
      
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và Tên</Label>
          <Input 
            id="name" 
            placeholder="VD: Nguyễn Văn A"
            className={errors.name ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
        </div>

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
          <Label htmlFor="password">Mật khẩu</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
            className={errors.password ? 'border-rose-300 focus-visible:ring-rose-200' : ''}
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Loại tài khoản</Label>
          <Select 
            value={watch('role')} 
            onValueChange={(val: any) => setValue('role', val, { shouldValidate: true })}
          >
            <SelectTrigger className={errors.role ? 'border-rose-300' : ''}>
              <SelectValue placeholder="Chọn loại tài khoản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candidate">Ứng viên tìm việc</SelectItem>
              <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-xs text-rose-500">{errors.role.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký ngay'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
          Đăng nhập
        </Link>
      </div>
    </>
  );
}
