'use client';
import { toast } from 'sonner';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Eye } from 'lucide-react';
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import BookmarkButton from './BookmarkButton';
import { formatDeadline } from '@/lib/utils';
import CompanyLogoMark from '@/components/shared/CompanyLogoMark';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
  isPremium?: boolean;
  variant?: 'default' | 'glass';
}

export default function JobCard({ job, isPremium = false, variant = 'default' }: JobCardProps) {
  const getSalary = () => {
    if (job.salary.min === 0 && job.salary.max === 0) return 'Thỏa thuận';
    return `$${job.salary.min.toLocaleString('vi-VN')} - $${job.salary.max.toLocaleString('vi-VN')}`;
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

  const isDark = isPremium || variant === 'glass';

  return (
    <Link href={`/jobs/${job._id}`} className="group block h-full">
      <motion.div 
        whileHover={{ 
          scale: 1.02, 
          y: -6,
          boxShadow: isPremium 
            ? '0 0 0 1.5px rgba(16,185,129,0.5), 0 20px 60px rgba(16,185,129,0.15)' 
            : '0 0 0 1.5px rgba(16,185,129,0.3), 0 20px 50px rgba(0,0,0,0.10)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`border rounded-2xl p-6 transition-colors duration-300 h-full flex flex-col relative overflow-hidden ${
          isPremium 
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-primary/30' 
            : variant === 'glass'
              ? 'bg-white/5 hover:bg-white/10 backdrop-blur-md border-white/10 shadow-xl'
              : 'bg-white border-slate-200'
        }`}
      >
        {/* Premium subtle glow overlay */}
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
        )}

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <CompanyLogoMark 
                name={job.company?.name || 'Công ty ẩn danh'} 
                industry={job.company?.industry} 
                logoUrl={job.company?.logo}
                size="md"
              />
              {isPremium && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-400 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity -z-10" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-bold tracking-tight transition-colors line-clamp-1 ${
                  isDark ? 'text-white group-hover:text-primary' : 'text-slate-900 group-hover:text-primary'
                }`}>
                  {job.title}
                </h3>
                {job.matchScore !== undefined && (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] px-1.5 py-0 h-4 leading-4 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)] whitespace-nowrap">
                    Phù hợp {job.matchScore}%
                  </Badge>
                )}
                {isPremium && job.matchScore === undefined && (
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-[10px] px-1.5 py-0 h-4 leading-4 uppercase tracking-wider font-bold animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                    HOT
                  </Badge>
                )}
              </div>
              <p className={`text-sm line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {job.company?.name || 'Công ty ẩn danh'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <BookmarkButton jobId={job._id} />
          </div>
        </div>

        <div className={`flex flex-wrap gap-y-2 gap-x-4 text-sm mb-5 relative z-10 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <MapPin className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-slate-400'}`} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-md">
            <DollarSign className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-primary'}`} />
            <span className={`font-bold text-primary`}>{getSalary()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-slate-400'}`} />
            <span>{getJobTypeLabel(job.jobType)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
          {job.requiredSkills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className={`font-medium border ${
              isDark 
                ? 'bg-slate-800/50 text-slate-300 border-slate-700 group-hover:border-primary/30 group-hover:text-primary' 
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {skill}
            </Badge>
          ))}
          {job.requiredSkills.length > 4 && (
            <Badge variant="outline" className={`font-medium border ${
              isDark ? 'bg-slate-800/50 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              +{job.requiredSkills.length - 4}
            </Badge>
          )}
        </div>

        <div className={`mt-auto flex justify-between items-center text-xs pt-4 border-t relative z-10 transition-colors ${
          isDark ? 'border-slate-800/50 text-slate-400 group-hover:border-slate-700/80' : 'border-slate-100 text-slate-400'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{job.views} lượt xem</span>
            </div>
            {job.level === 'intern' || job.level === 'fresher' ? (
              <span className={`font-medium px-2 py-0.5 rounded ${
                isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
              }`}>
                Entry Level
              </span>
            ) : null}
            {(() => {
              if (!job.deadline) return null;
              const daysLeft = (new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
              if (daysLeft > 0 && daysLeft <= 3) {
                return (
                  <span className="font-medium px-2 py-0.5 rounded bg-rose-500/20 text-rose-500">
                    Sắp hết hạn
                  </span>
                );
              }
              return null;
            })()}
          </div>
          
          <div className={`font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1 text-primary`}>
            Xem chi tiết <span className="text-lg leading-none">&rarr;</span>
          </div>
        </div>
        
        {/* Quick Apply Button on Hover */}
        <div className="absolute bottom-5 right-5 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-1.5 px-4 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5">
            <span className="text-[12px]">⚡</span> Ứng tuyển nhanh
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
