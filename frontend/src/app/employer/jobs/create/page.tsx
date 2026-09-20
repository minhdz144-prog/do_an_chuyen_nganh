'use client';
import { toast } from 'sonner';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import JobForm from '@/components/employer/JobForm';

export default function CreateJobPage() {
  const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
            
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
      toast.error(error.message || 'Có lỗi xảy ra khi đăng tin.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl bg-card rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mb-8 border-b border-border pb-6 flex items-center gap-4">
        <Link href="/employer/jobs" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Đăng tin tuyển dụng mới</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Điền đầy đủ thông tin để thu hút ứng viên tốt nhất.</p>
        </div>
      </div>


      <JobForm mode="create" onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
