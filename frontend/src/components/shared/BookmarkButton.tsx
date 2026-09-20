'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  jobId: string;
  className?: string;
}

export default function BookmarkButton({ jobId, className }: BookmarkButtonProps) {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Chỉ hiển thị button nếu user là candidate
  if (user?.role !== 'candidate') return null;

  const isSaved = user.savedJobs?.includes(jobId) || false;

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn trigger link bọc ngoài JobCard
    e.stopPropagation();
    if (loading) return;

    // Optimistic Update
    const previousSavedJobs = [...(user.savedJobs || [])];
    const isCurrentlySaved = previousSavedJobs.includes(jobId);
    const newSavedJobs = isCurrentlySaved 
      ? previousSavedJobs.filter(id => id !== jobId)
      : [...previousSavedJobs, jobId];
    
    updateUser({ savedJobs: newSavedJobs });
    setLoading(true);

    try {
      const res: any = await axiosInstance.post(`/users/me/saved-jobs/${jobId}`);
      // Lấy danh sách thực tế từ server trả về để đồng bộ lại nếu cần
      if (res.data.saved !== !isCurrentlySaved) {
        // Đôi khi server trả về kết quả khác với mong đợi (do race condition)
        const serverSavedJobs = res.data.saved 
          ? [...previousSavedJobs.filter(id => id !== jobId), jobId]
          : previousSavedJobs.filter(id => id !== jobId);
        updateUser({ savedJobs: serverSavedJobs });
      }
      toast.success(res.data.saved ? 'Đã lưu việc làm thành công' : 'Đã bỏ lưu việc làm');
    } catch (error: any) {
      console.error('Lỗi khi lưu tin tuyển dụng:', error);
      // Rollback
      updateUser({ savedJobs: previousSavedJobs });
      toast.error(error.message || 'Không thể lưu việc làm, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        "p-2 rounded-full transition-colors flex items-center justify-center",
        isSaved 
          ? "bg-primary/10 text-primary hover:bg-primary/20" 
          : "bg-muted/50 text-muted-foreground/80 dark:text-muted-foreground hover:bg-slate-100 hover:text-muted-foreground dark:text-muted-foreground",
        className
      )}
      title={isSaved ? "Bỏ lưu tin này" : "Lưu tin này"}
    >
      <Bookmark className={cn("w-5 h-5 transition-all", isSaved ? "fill-emerald-600 text-primary" : "")} />
    </button>
  );
}
