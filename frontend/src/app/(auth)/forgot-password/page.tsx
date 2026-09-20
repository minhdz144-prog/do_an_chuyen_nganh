'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

const resetSchema = z.object({
  otp: z.string().min(6, 'Mã OTP gồm 6 chữ số').max(6, 'Mã OTP gồm 6 chữ số'),
  newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSendOTP = async (data: EmailFormValues) => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setStep('otp');
      toast.success('Mã OTP đã được gửi! Vui lòng kiểm tra hộp thư email.');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi mã OTP');
    }
  };

  const onResetPassword = async (data: ResetFormValues) => {
    try {
      await axiosInstance.post('/auth/reset-password', {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Không thể đặt lại mật khẩu');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          {step === 'email' ? <Mail className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
        </div>
        <h2 className="text-2xl font-bold text-white drop-shadow-sm">
          {step === 'email' ? 'Quên mật khẩu?' : 'Nhập mã xác nhận'}
        </h2>
        <p className="text-white/60 text-sm mt-2">
          {step === 'email' 
            ? 'Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP cho bạn.' 
            : `Mã OTP đã gửi đến ${email}`}
        </p>
      </div>

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-6">
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className={`w-full bg-transparent border-0 border-b ${emailForm.formState.errors.email ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...emailForm.register('email')}
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-rose-400 px-2 mt-1">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-lg font-bold text-[15px] transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {emailForm.formState.isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP + New Password */}
      {step === 'otp' && (
        <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-6">
          <div className="space-y-1">
            <input
              type="text"
              maxLength={6}
              placeholder="Nhập mã OTP (6 chữ số)"
              className={`w-full bg-transparent border-0 border-b ${resetForm.formState.errors.otp ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none text-center text-2xl tracking-[0.5em] font-mono`}
              {...resetForm.register('otp')}
            />
            {resetForm.formState.errors.otp && (
              <p className="text-xs text-rose-400 px-2 mt-1">{resetForm.formState.errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              className={`w-full bg-transparent border-0 border-b ${resetForm.formState.errors.newPassword ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...resetForm.register('newPassword')}
            />
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-rose-400 px-2 mt-1">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className={`w-full bg-transparent border-0 border-b ${resetForm.formState.errors.confirmPassword ? 'border-rose-400' : 'border-white/50'} rounded-none focus:ring-0 focus:border-white px-2 py-2 text-white placeholder:text-white/60 transition-colors outline-none`}
              {...resetForm.register('confirmPassword')}
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-xs text-rose-400 px-2 mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={resetForm.formState.isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-lg font-bold text-[15px] transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {resetForm.formState.isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('email'); resetForm.reset(); }}
            className="w-full text-white/60 hover:text-white text-sm transition-colors"
          >
            ← Gửi lại mã OTP
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
