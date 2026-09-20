'use client';
import { BarChart, TrendingUp, Users, Briefcase } from 'lucide-react';

export default function AdminStatsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground mt-1">Tính năng phân tích dữ liệu chuyên sâu đang được phát triển.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
          <BarChart className="w-10 h-10 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Tính năng Sắp ra mắt</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Phân hệ thống kê doanh thu, báo cáo tăng trưởng người dùng và xu hướng tuyển dụng chuyên sâu (AI Analytics) đang trong giai đoạn phát triển và sẽ sớm được cập nhật ở phiên bản tiếp theo.
        </p>
      </div>
    </div>
  );
}
