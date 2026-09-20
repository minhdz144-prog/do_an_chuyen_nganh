'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, TrendingUp, Clock, Sparkles, MapPin, DollarSign, Eye, Briefcase } from 'lucide-react';
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import BookmarkButton from '../shared/BookmarkButton';
import CompanyLogoMark from '../shared/CompanyLogoMark';
import SectionReveal from '../shared/SectionReveal';
import { motion, AnimatePresence } from 'framer-motion';

type TabKey = 'latest' | 'highSalary' | 'hot';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'latest', label: 'Mới nhất', icon: Clock },
  { key: 'highSalary', label: 'Lương cao', icon: TrendingUp },
  { key: 'hot', label: 'Đang HOT', icon: Flame },
];

interface LatestJobsSectionProps {
  allJobs: Job[];
}

function getSalary(job: Job) {
  if (!job.salary || (job.salary.min === 0 && job.salary.max === 0)) return 'Thỏa thuận';
  return `$${job.salary.min.toLocaleString('vi-VN')} - $${job.salary.max.toLocaleString('vi-VN')}`;
}

function getJobTypeLabel(type: string) {
  const map: Record<string, string> = {
    'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian',
    remote: 'Từ xa', internship: 'Thực tập', contract: 'Hợp đồng',
  };
  return map[type] || type;
}

/* ─── Featured Card (vị trí #1, chiếm 2 cột) ─── */
function FeaturedCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job._id}`} className="group block h-full">
      <motion.div 
        whileHover={{ y: -6, boxShadow: '0 0 0 1.5px rgba(16,185,129,0.4), 0 25px 60px rgba(16,185,129,0.12)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl overflow-hidden"
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <CompanyLogoMark 
                  name={job.company?.name || 'Ẩn danh'} 
                  industry={job.company?.industry}
                  logoUrl={job.company?.logo}
                  size="lg"
                />
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-indigo-400 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity -z-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight mb-1.5">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-400">{job.company?.name || 'Ẩn danh'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold shadow-lg shadow-amber-500/25">
                <Sparkles className="w-3 h-3 mr-1" /> #1
              </Badge>
              <BookmarkButton jobId={job._id} />
            </div>
          </div>

          {/* Salary — big and prominent */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-3.5">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{getSalary(job)}</span>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-3 text-sm text-slate-300 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
              <MapPin className="w-4 h-4 text-emerald-400" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
              <Briefcase className="w-4 h-4 text-emerald-400" /> {getJobTypeLabel(job.jobType || (job as any).type || 'full-time')}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(job.requiredSkills || []).slice(0, 5).map(s => (
              <Badge key={s} variant="outline" className="bg-white/5 text-slate-300 border-white/10 font-medium group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-colors">
                {s}
              </Badge>
            ))}
          </div>

          {/* Description */}
          {job.description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
          )}

          {/* Bottom bar */}
          <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Eye className="w-4 h-4" /> {job.views} lượt xem
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300">
              Xem chi tiết <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Ranked Card (vị trí #2 → #6, có số thứ hạng) ─── */
function RankedCard({ job, rank }: { job: Job; rank: number }) {
  return (
    <Link href={`/jobs/${job._id}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 0 0 1px rgba(16,185,129,0.3), 0 16px 40px rgba(0,0,0,0.2)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-md overflow-hidden hover:bg-white/[0.07] transition-colors duration-300"
      >
        {/* Rank badge */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
          #{rank}
        </div>

        <div className="relative z-10 p-5">
          <div className="flex gap-3 items-center mb-4">
            <CompanyLogoMark 
              name={job.company?.name || 'Ẩn danh'}
              industry={job.company?.industry}
              logoUrl={job.company?.logo}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">{job.company?.name || 'Ẩn danh'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-600" /> {job.location}
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/10 rounded-lg px-3 py-1.5 mb-4 w-fit">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{getSalary(job)}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(job.requiredSkills || []).slice(0, 3).map(s => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                {s}
              </span>
            ))}
            {(job.requiredSkills || []).length > 3 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-500">
                +{job.requiredSkills.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-3 border-t border-white/5">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {job.views}</span>
            <span className="text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Xem →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Main Section ─── */
export default function LatestJobsSection({ allJobs }: LatestJobsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('latest');

  const displayJobs = useMemo(() => {
    let sorted: Job[];
    switch (activeTab) {
      case 'highSalary':
        sorted = [...allJobs].sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
        break;
      case 'hot':
        sorted = [...allJobs].sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
      default:
        sorted = [...allJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted.slice(0, 7);
  }, [allJobs, activeTab]);

  const featured = displayJobs[0];
  const sideJobs = displayJobs.slice(1, 3);
  const bottomJobs = displayJobs.slice(3, 7);

  if (!featured) return null;

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background Image & Overlay — same as Category Jobs section */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: 'url("/images/categories-bg.jpg")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundAttachment: 'fixed' 
        }} 
      />
      <div className="absolute inset-0 bg-slate-950/95 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141517] via-transparent to-[#141517] z-0" />
      
      {/* Glow orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/[0.07] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header with tabs */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <SectionReveal>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Cập nhật realtime
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                Việc làm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">mới nhất</span>
              </h2>
              <p className="text-lg text-slate-500">Cập nhật những cơ hội nghề nghiệp hôm nay</p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="flex items-center gap-2">
              {/* Filter tabs */}
              <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-2xl p-1.5">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-tab-bg"
                          className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-emerald-500/60 rounded-xl"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon className="w-4 h-4" /> {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Link href="/jobs" className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-400 font-semibold transition-colors ml-4">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </SectionReveal>
        </div>

        {/* Bento Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Row 1: Featured (2 cols) + 2 ranked cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
              {/* Featured — spans 7 cols */}
              <div className="lg:col-span-7">
                <FeaturedCard job={featured} />
              </div>
              {/* Side stack — spans 5 cols */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {sideJobs.map((job, i) => (
                  <RankedCard key={job._id} job={job} rank={i + 2} />
                ))}
              </div>
            </div>

            {/* Row 2: 4 equal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bottomJobs.map((job, i) => (
                <RankedCard key={job._id} job={job} rank={i + 4} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all">
            Xem tất cả việc làm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
