'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-display">
          403 - Truy cập bị từ chối
        </h1>
        <p className="text-muted-foreground">
          Xin lỗi, bạn không có quyền truy cập vào trang này. Phân quyền của tài khoản hiện tại không cho phép thao tác này.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link href="/" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6")}>
            Về trang chủ
          </Link>
          <button onClick={() => window.history.back()} className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-6")}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
