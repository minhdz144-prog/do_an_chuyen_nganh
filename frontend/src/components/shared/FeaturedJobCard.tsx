'use client';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import BookmarkButton from './BookmarkButton';
import CompanyLogoMark from '@/components/shared/CompanyLogoMark';
import { motion } from 'framer-motion';

interface FeaturedJobCardProps {
  job: Job;
}

export default function FeaturedJobCard({ job }: FeaturedJobCardProps) {
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

  return (
    <Link href={`/jobs/${job._id}`} className="group block h-full">
      <motion.div 
        whileHover={{ 
          scale: 1.01, 
          y: -4,
          boxShadow: '0 0 0 1.5px rgba(16,185,129,0.5), 0 25px 60px rgba(16,185,129,0.15)',
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden flex flex-col"
      >
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Top section: Company + Badge */}
        <div className="relative z-10 p-8 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <CompanyLogoMark 
                  name={job.company?.name || 'Công ty ẩn danh'} 
                  industry={job.company?.industry} 
                  logoUrl={job.company?.logo}
                  size="lg"
                />
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-indigo-400 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity -z-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {job.company?.name || 'Công ty ẩn danh'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-[10px] px-2.5 py-0.5 h-5 leading-5 uppercase tracking-wider font-bold animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.5)]">
                <Sparkles className="w-3 h-3 mr-1" />
                HOT
              </Badge>
              <BookmarkButton jobId={job._id} />
            </div>
          </div>
        </div>

        {/* Middle: Key info with prominent salary */}
        <div className="relative z-10 px-8 py-6 flex-1 flex flex-col justify-center">
          {/* Salary highlight */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-5 py-3">
              <DollarSign className="w-6 h-6 text-primary" />
              <span className="text-2xl font-extrabold text-primary tracking-tight">{getSalary()}</span>
            </div>
          </div>

          {/* Location & Type */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-6">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{getJobTypeLabel(job.jobType || (job as any).type || 'full-time')}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(job.requiredSkills || []).slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="font-medium bg-slate-800/50 text-slate-300 border-slate-700 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                {skill}
              </Badge>
            ))}
            {(job.requiredSkills || []).length > 6 && (
              <Badge variant="outline" className="font-medium bg-slate-800/50 text-slate-400 border-slate-700">
                +{job.requiredSkills.length - 6}
              </Badge>
            )}
          </div>

          {/* Description preview */}
          {job.description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {job.description}
            </p>
          )}
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-8 py-5 border-t border-slate-800 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{job.views} lượt xem</span>
            </div>
            {(job.level === 'intern' || job.level === 'fresher') && (
              <span className="font-medium px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300">
                Entry Level
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-primary font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Xem chi tiết <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Apply floating button */}
        <div className="absolute bottom-20 right-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 px-5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5">
            <span className="text-[12px]">⚡</span> Ứng tuyển nhanh
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
