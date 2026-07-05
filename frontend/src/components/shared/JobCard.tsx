import Link from 'next/link';
import { MapPin, DollarSign, Building2, Clock, Eye } from 'lucide-react';
import { Job } from '@/lib/api/jobs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

// Vì shadcn init nãy không cài Card, ta tự giả lập ui/card nhanh hoặc dùng div thuần có class Tailwind.
// Thôi thay vì phụ thuộc Card (có thể chưa cài), dùng div cho chắc ăn và chuẩn design system:
// bg-white, border border-slate-100, rounded-2xl.

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const getSalary = () => {
    if (job.salary.min === 0 && job.salary.max === 0) return 'Thỏa thuận';
    return `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`;
  };

  const getJobTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      remote: 'Từ xa',
      internship: 'Thực tập',
      contract: 'Hợp đồng',
    };
    return map[type] || type;
  };

  return (
    <Link href={`/jobs/${job._id}`} className="group block">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-slate-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
              {job.company?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500">{job.company?.name || 'Công ty ẩn danh'}</p>
            </div>
          </div>
          {job.level === 'intern' || job.level === 'fresher' ? (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
              Entry Level
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">{getSalary()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{getJobTypeLabel(job.jobType)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.requiredSkills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="bg-slate-50 text-slate-600 font-normal">
              {skill}
            </Badge>
          ))}
          {job.requiredSkills.length > 4 && (
            <Badge variant="outline" className="bg-slate-50 text-slate-500 font-normal">
              +{job.requiredSkills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{job.views} lượt xem</span>
          </div>
          <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </Link>
  );
}
