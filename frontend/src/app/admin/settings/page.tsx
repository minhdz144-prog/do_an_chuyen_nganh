'use client';
import { Settings, Shield, Bell, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground mt-1">Cấu hình chung, bảo mật và thông báo cho nền tảng.</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-card border border-border rounded-full flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-emerald-500 animate-[spin_4s_linear_infinite]" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-3">Hệ thống đang bảo trì module này</h2>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Tính năng thiết lập cấu hình cổng thanh toán, tích hợp API Gửi Mail và cấu hình AI Matching đang được nâng cấp để tối ưu hóa hiệu suất và bảo mật.
        </p>
      </div>
    </div>
  );
}
