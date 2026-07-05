'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Search, ShieldBan, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const ROLE_BADGES: Record<string, string> = {
  candidate: 'bg-emerald-100 text-emerald-800',
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
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1">Xem và quản lý tất cả tài khoản trong hệ thống.</p>
        </div>

        {/* Filter theo role */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">Tất cả vai trò</option>
          <option value="candidate">Ứng viên</option>
          <option value="employer">Nhà tuyển dụng</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGES[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Không hiển thị nút khóa cho tài khoản admin khác */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionLoading === user._id}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
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
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Trang {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
