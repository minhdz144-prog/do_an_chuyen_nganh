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
    router.push(`/jobs${createPageUrl(page)}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="border-slate-200 text-slate-600"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <span className="text-sm font-medium text-slate-700 px-4">
        Trang {currentPage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="border-slate-200 text-slate-600"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
