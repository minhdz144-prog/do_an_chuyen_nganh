'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(`/jobs${createPageUrl(page)}`, { scroll: false });
    
    // Tìm container và cuộn mượt mà lên đó
    const element = document.getElementById('job-list-container');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="border-slate-200 dark:border-slate-700 text-muted-foreground dark:text-muted-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <span className="text-sm font-medium text-foreground/80 px-4">
        Trang {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="border-slate-200 dark:border-slate-700 text-muted-foreground dark:text-muted-foreground"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
