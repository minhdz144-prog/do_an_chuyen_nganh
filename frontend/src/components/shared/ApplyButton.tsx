'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { Job } from '@/types/job';

interface ApplyButtonProps {
  job: Job;
}

export default function ApplyButton({ job }: ApplyButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/jobs/${job._id}`);
      return;
    }
    if (user?.role !== 'candidate') {
      toast.error('Chỉ ứng viên (Candidate) mới có thể nộp đơn!');
      return;
    }
    setDialogOpen(true);
  };

  const handleGenerateCoverLetter = async () => {
    try {
      setAiLoading(true);
      const res: any = await axiosInstance.post('/ai/cover-letter', {
        jobTitle: job.title,
        jobDescription: job.description,
        companyName: job.company?.name,
      });
      setCoverLetter(res.data?.coverLetter || '');
      toast.success('Đã sinh Cover Letter thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi sinh Cover Letter');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/jobs/${job._id}/apply`, {
        coverLetter: coverLetter.trim()
      });
      setSuccess(true);
      setDialogOpen(false);
      toast.success('Ứng tuyển thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi nộp đơn. Bạn có thể đã nộp đơn rồi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Button disabled className="w-full bg-emerald-600 text-white opacity-100">
        <CheckIcon className="w-4 h-4 mr-2" /> Đã nộp đơn
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={handleOpenDialog} 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
      >
        Ứng tuyển ngay
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Ứng tuyển: {job.title}</DialogTitle>
            <DialogDescription>
              Hãy viết một bức thư xin việc ngắn gọn để gây ấn tượng với nhà tuyển dụng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateCoverLetter}
                disabled={aiLoading}
                className="text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700 h-9 px-3 gap-1.5"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI viết Cover Letter
              </Button>
            </div>
            
            <Textarea
              placeholder="Kính gửi Nhà tuyển dụng..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[250px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              * Mẹo: Sử dụng AI để tự động sinh Cover Letter dựa trên Profile của bạn và yêu cầu của Job này.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={loading}>Hủy</Button>
            <Button onClick={handleApply} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Nộp hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
