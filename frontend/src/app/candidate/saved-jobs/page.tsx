'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import JobCard from '@/components/shared/JobCard';
import { Bookmark, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res: any = await axiosInstance.get('/users/me/saved-jobs');
        setSavedJobs(res.data.savedJobs || []);
      } catch (error) {
        console.error('Lỗi khi tải việc làm đã lưu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-primary/90" />
          Việc làm đã lưu
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">Danh sách các cơ hội nghề nghiệp bạn đã đánh dấu để xem lại sau.</p>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground dark:text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Chưa có việc làm nào được lưu</h2>
          <p className="text-muted-foreground dark:text-muted-foreground max-w-md mx-auto mb-8">
            Bạn chưa đánh dấu lưu bất kỳ tin tuyển dụng nào. Hãy lướt xem các cơ hội mới và nhấn nút lưu để dễ dàng ứng tuyển sau nhé.
          </p>
          <Link href="/jobs">
            <Button className="bg-primary hover:bg-primary px-8">
              Khám phá việc làm ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
