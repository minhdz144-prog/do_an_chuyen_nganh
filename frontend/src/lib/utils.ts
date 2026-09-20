import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * formatDeadline — dùng chung ở mọi nơi hiển thị deadline.
 * Trả về "Không giới hạn" nếu deadline không hợp lệ / null / undefined.
 */
export function formatDeadline(deadline?: string | Date | null): string {
  if (!deadline) return 'Không giới hạn';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 'Không giới hạn';
  return d.toLocaleDateString('vi-VN');
}
