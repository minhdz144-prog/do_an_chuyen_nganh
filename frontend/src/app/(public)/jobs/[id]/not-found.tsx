import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-muted-foreground/80 dark:text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy công việc</h2>
      <p className="text-muted-foreground dark:text-muted-foreground mb-8 max-w-md">
        Rất tiếc, công việc bạn đang tìm kiếm có thể đã hết hạn, bị xóa hoặc đường dẫn không chính xác.
      </p>
      <Link href="/jobs" className={cn(buttonVariants(), "bg-slate-900 text-white hover:bg-slate-800")}>
        Xem các công việc khác
      </Link>
    </div>
  );
}
