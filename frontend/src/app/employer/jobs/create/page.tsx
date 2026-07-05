'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import JobForm from '@/components/employer/JobForm';

export default function CreateJobPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      const payload = {
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        location: data.location,
        salary: { min: data.salaryMin, max: data.salaryMax },
        jobType: data.jobType,
        level: data.level,
        deadline: data.deadline || undefined,
        status: 'active'
      };

      await axiosInstance.post('/jobs', payload);
      router.push('/employer/jobs');
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi đăng tin.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
        <Link href="/employer/jobs" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng tin tuyển dụng mới</h1>
          <p className="text-slate-500 mt-1">Điền đầy đủ thông tin để thu hút ứng viên tốt nhất.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          {errorMsg}
        </div>
      )}

      <JobForm mode="create" onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
