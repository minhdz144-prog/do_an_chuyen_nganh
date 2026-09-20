'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Check, BellRing } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications: pollNotifications
  } = useNotificationStore();


  useEffect(() => {
    fetchNotifications();

    // Fallback polling (mỗi 30s)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground outline-none">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Thông báo</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <Check className="w-3 h-3 mr-1" />
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        
        <div className="max-h-[60vh] overflow-y-auto flex flex-col">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notif) => (
              <Link 
                key={notif._id} 
                href={notif.link || '#'}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif._id);
                }}
              >
                <div className={`p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-2 block">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Bạn không có thông báo nào</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
