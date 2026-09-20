'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Dummy data for notifications
const DUMMY_NOTIFICATIONS = [
  { id: 1, title: 'Ứng viên mới', message: 'Nguyen Van A vừa ứng tuyển vào vị trí Frontend Developer', time: '5 phút trước', isRead: false },
  { id: 2, title: 'Lịch phỏng vấn', message: 'Phỏng vấn với Tran Thi B sắp diễn ra trong 30 phút nữa', time: '30 phút trước', isRead: false },
  { id: 3, title: 'Hệ thống', message: 'Tài khoản của bạn đã được nâng cấp lên gói Pro', time: '2 giờ trước', isRead: true },
  { id: 4, title: 'Báo cáo', message: 'Thống kê tuyển dụng tháng 6 đã sẵn sàng', time: '1 ngày trước', isRead: true },
];

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative hover:bg-muted/50 rounded-full h-10 w-10 flex items-center justify-center outline-none transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96 p-0 glass-panel rounded-2xl mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Thông báo</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 h-5 px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={markAllAsRead} title="Đánh dấu tất cả đã đọc">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-500" onClick={clearAll} title="Xóa tất cả">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
              <MailOpen className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Bạn không có thông báo nào</p>
            </div>
          ) : (
            <DropdownMenuGroup className="space-y-1">
              {notifications.map((notif) => (
                <DropdownMenuItem 
                  key={notif.id} 
                  className={cn(
                    "p-3 cursor-pointer rounded-xl items-start gap-3 transition-colors",
                    !notif.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                  )}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    !notif.isRead ? "bg-primary" : "bg-transparent"
                  )} />
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm leading-none",
                      !notif.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                    )}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-medium">
                      {notif.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5 h-8">
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
