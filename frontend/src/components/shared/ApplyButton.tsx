'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';

interface ApplyButtonProps {
  jobId: string;
}

export default function ApplyButton({ jobId }: ApplyButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/jobs/${jobId}`);
      return;
    }
    
    if (user?.role !== 'candidate') {
      alert('Chỉ ứng viên (Candidate) mới có thể nộp đơn!');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/jobs/${jobId}/apply`);
      setSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi nộp đơn. Bạn có thể đã nộp đơn rồi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Button disabled className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
        Đã nộp đơn thành công
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleApply} 
      disabled={loading}
      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
    >
      {loading ? 'Đang xử lý...' : 'Ứng tuyển ngay'}
    </Button>
  );
}
