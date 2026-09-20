'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/notificationStore';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socketInstance.on('connect', () => {
      socketInstance.emit('join_user_room', user._id);
    });

    socketInstance.on('new_application', (data: any) => {
      useNotificationStore.getState().fetchNotifications();
      toast.info(data.message, {
        duration: 5000,
        action: {
          label: 'Xem ngay',
          onClick: () => window.location.href = '/employer/applications'
        }
      });
    });

    socketInstance.on('status_changed', (data: any) => {
      useNotificationStore.getState().fetchNotifications();
      toast.success(data.message, {
        duration: 5000,
        action: {
          label: 'Chi tiết',
          onClick: () => window.location.href = '/candidate/applications'
        }
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return <>{children}</>;
}
