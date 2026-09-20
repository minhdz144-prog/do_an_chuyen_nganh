'use client';
import Image from 'next/image';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Building2, CheckCircle2, XCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompanies = async (currentPage = 1, verified = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(currentPage), limit: '15' });
      if (verified) params.set('isVerified', verified);
      const res: any = await axiosInstance.get(`/admin/companies?${params}`);
      setCompanies(res.data.companies || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Lỗi tải danh sách công ty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(page, filterVerified); }, [page, filterVerified]);

  const handleToggleVerify = async (companyId: string, currentStatus: boolean) => {
    try {
      setActionLoading(companyId);
      await axiosInstance.patch(`/admin/companies/${companyId}/verify`, { isVerified: !currentStatus });
      setCompanies(prev => prev.map(c => c._id === companyId ? { ...c, isVerified: !currentStatus } : c));
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
          <h1 className="text-2xl font-bold text-foreground">Duyệt công ty</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Xác minh công ty trước khi cho phép đăng tin tuyển dụng.</p>
        </div>
        <select
          value={filterVerified}
          onChange={(e) => { setFilterVerified(e.target.value); setPage(1); }}
          className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-foreground/80 bg-card focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">Tất cả</option>
          <option value="false">Chưa xác minh</option>
          <option value="true">Đã xác minh</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground dark:text-muted-foreground">Đang tải...</div>
        ) : companies.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground dark:text-muted-foreground">Không có công ty nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground dark:text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Công ty</th>
                  <th className="px-6 py-4">Chủ sở hữu</th>
                  <th className="px-6 py-4">Lĩnh vực</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-muted/50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {company.logo ? (
                            <Image src={company.logo} alt="" fill sizes="48px" className="object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground/80 dark:text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{company.name}</p>
                          <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground">{company.location || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground/80">{company.ownerId?.name}</p>
                      <p className="text-xs text-muted-foreground/80 dark:text-muted-foreground">{company.ownerId?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground dark:text-muted-foreground">{company.industry || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        company.isVerified ? 'bg-primary/20 text-primary' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {company.isVerified ? <><CheckCircle2 className="w-3 h-3" />Đã xác minh</> : <><XCircle className="w-3 h-3" />Chờ duyệt</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleVerify(company._id, company.isVerified)}
                        disabled={actionLoading === company._id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          company.isVerified
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-primary bg-primary/10 hover:bg-primary/20'
                        } disabled:opacity-50`}
                      >
                        {company.isVerified ? 'Hủy xác minh' : '✓ Duyệt công ty'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Trang {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-muted/50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-muted/50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
