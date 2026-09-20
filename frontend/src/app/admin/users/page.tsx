'use client';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Search, ShieldBan, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ROLE_BADGES: Record<string, string> = {
  candidate: 'bg-primary/20 text-emerald-800',
  employer: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
};

const ROLE_LABELS: Record<string, string> = {
  candidate: 'Ứng viên',
  employer: 'Nhà tuyển dụng',
  admin: 'Admin',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async (currentPage = 1, role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(currentPage), limit: '15' });
      if (role) params.set('role', role);
      const res: any = await axiosInstance.get(`/admin/users?${params}`);
      setUsers(res.data.users || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi tải danh sách user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, roleFilter);
  }, [page, roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      // Cập nhật state local để không phải refetch
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Xem và quản lý tất cả tài khoản trong hệ thống.</p>
        </div>

        {/* Filter theo role */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-foreground/80 bg-card focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">Tất cả vai trò</option>
          <option value="candidate">Ứng viên</option>
          <option value="employer">Nhà tuyển dụng</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground dark:text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 font-display">Người dùng</th>
                  <th className="px-4 py-3 font-display">Vai trò</th>
                  <th className="px-4 py-3 font-display">Trạng thái</th>
                  <th className="px-4 py-3 font-display">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-display">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGES[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.isActive ? 'bg-primary/20 text-primary' : 'bg-rose-100 text-rose-700'}`}>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground dark:text-muted-foreground font-mono">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Không hiển thị nút khóa cho tài khoản admin khác */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionLoading === user._id}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-primary bg-primary/10 hover:bg-primary/20'
                          } disabled:opacity-50`}
                        >
                          {user.isActive ? (
                            <><ShieldBan className="w-3.5 h-3.5" />Khóa tài khoản</>
                          ) : (
                            <><ShieldCheck className="w-3.5 h-3.5" />Mở khóa</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Trang {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-muted/50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-muted/50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
