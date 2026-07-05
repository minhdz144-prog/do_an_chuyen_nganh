'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { MapPin, DollarSign, Briefcase, TrendingUp, CheckCircle, XCircle, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

// Kiểu dữ liệu trả về từ API recommendations
interface Recommendation {
  job: {
    _id: string; title: string; location: string;
    salary: { min: number; max: number };
    jobType: string; level: string;
    company: { name: string; logo?: string };
    requiredSkills: string[];
  };
  score: number;    // Điểm phần trăm trùng khớp (0–100)
  matched: string[];  // Kỹ năng đã có
  missing: string[];  // Kỹ năng còn thiếu
}

export default function RecommendedJobsPage() {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const hasSkills = (user?.candidateProfile?.skills?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasSkills) { setLoading(false); return; }
    
    const fetchRecommended = async () => {
      try {
        const res: any = await axiosInstance.get('/jobs/recommended?threshold=0&limit=30');
        setRecommendations(res.data.recommendations || []);
      } catch (error) {
        console.error('Lỗi tải gợi ý việc làm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, [hasSkills]);

  // Empty state khi chưa có kỹ năng
  if (!hasSkills && !loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa thể gợi ý việc làm</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Hãy cập nhật kỹ năng của bạn để hệ thống AI tính toán độ phù hợp và gợi ý các công việc phù hợp nhất.
        </p>
        <Link
          href="/candidate/profile"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          <UserCog className="w-4 h-4" />
          Cập nhật hồ sơ ngay
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Đang phân tích kỹ năng và tìm việc phù hợp...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Việc làm gợi ý cho bạn</h1>
        </div>
        <p className="text-slate-500">
          {recommendations.length} công việc phù hợp dựa trên kỹ năng: 
          <span className="font-medium text-slate-700"> {user?.candidateProfile?.skills?.join(', ')}</span>
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-slate-500">Không tìm thấy công việc phù hợp. Hãy thêm nhiều kỹ năng hơn.</p>
          <Link href="/candidate/profile" className="text-emerald-600 font-medium underline mt-2 block">
            Cập nhật kỹ năng
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(({ job, score, matched, missing }) => (
            <div key={job._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-emerald-100 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    {job.company.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={job.company.logo} alt="logo" className="w-14 h-14 rounded-xl border border-slate-100 object-cover" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-xl font-bold text-slate-400">
                        {job.company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link href={`/jobs/${job._id}`} className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                        {job.title}
                      </Link>
                      <p className="text-slate-500 font-medium">{job.company.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {job.salary?.min ? `$${job.salary.min} - $${job.salary.max}` : 'Thỏa thuận'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Briefcase className="w-3.5 h-3.5" />{job.jobType}
                    </span>
                  </div>

                  {/* ★ Widget kỹ năng: xanh = đã có, đỏ = còn thiếu */}
                  <div className="space-y-2">
                    {matched.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {matched.map(skill => (
                          <span key={skill} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
                            <CheckCircle className="w-3 h-3" />{skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {missing.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {missing.map(skill => (
                          <span key={skill} className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100">
                            <XCircle className="w-3 h-3" />{skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Widget */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 min-w-[140px] border border-slate-100">
                  {/* ★ Progress circle thể hiện điểm matching */}
                  <div className="relative w-20 h-20 mb-2">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-200" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        className={cn("transition-all", score >= 70 ? "stroke-emerald-500" : score >= 40 ? "stroke-amber-400" : "stroke-rose-400")}
                        strokeWidth="3"
                        strokeDasharray={`${score} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn("text-xl font-black", score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-500")}>
                        {score}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center font-medium">Độ phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1">{matched.length}/{matched.length + missing.length} kỹ năng</p>

                  <Link
                    href={`/jobs/${job._id}`}
                    className="mt-4 w-full text-center bg-slate-900 text-white text-sm py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors font-medium"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
