'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Job } from '@/types/job';
import JobCard from '@/components/shared/JobCard';
import SectionReveal from '@/components/shared/SectionReveal';
import { ChevronRight, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface CategoryJobsSectionProps {
  title: string;
  subtitle: string;
  jobs: Job[];
  theme: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo' | 'orange' | 'teal';
  bgImage?: string;
}

const THEME_MAP = {
  blue: 'from-blue-700 to-indigo-900 border-blue-500/30 text-blue-100',
  amber: 'from-amber-600 to-yellow-900 border-amber-500/30 text-amber-100',
  emerald: 'from-emerald-700 to-teal-900 border-emerald-500/30 text-emerald-100',
  purple: 'from-purple-700 to-fuchsia-900 border-purple-500/30 text-purple-100',
  rose: 'from-rose-600 to-red-900 border-rose-500/30 text-rose-100',
  indigo: 'from-indigo-700 to-blue-950 border-indigo-500/30 text-indigo-100',
  orange: 'from-orange-600 to-red-800 border-orange-500/30 text-orange-100',
  teal: 'from-teal-700 to-cyan-900 border-teal-500/30 text-teal-100',
};

const TAB_ACTIVE_COLORS = {
  blue: 'bg-blue-600 text-white',
  amber: 'bg-amber-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
  rose: 'bg-rose-600 text-white',
  indigo: 'bg-indigo-600 text-white',
  orange: 'bg-orange-600 text-white',
  teal: 'bg-teal-600 text-white',
};

const TAB_HOVER_COLORS = {
  blue: 'hover:text-blue-600 dark:hover:text-blue-400',
  amber: 'hover:text-amber-600 dark:hover:text-amber-400',
  emerald: 'hover:text-emerald-600 dark:hover:text-emerald-400',
  purple: 'hover:text-purple-600 dark:hover:text-purple-400',
  rose: 'hover:text-rose-600 dark:hover:text-rose-400',
  indigo: 'hover:text-indigo-600 dark:hover:text-indigo-400',
  orange: 'hover:text-orange-600 dark:hover:text-orange-400',
  teal: 'hover:text-teal-600 dark:hover:text-teal-400',
};

export function CategoryJobsSection({ title, subtitle, jobs, theme, bgImage }: CategoryJobsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('Tất cả');

  // Extract unique locations from jobs for tabs (top 4 locations)
  const locations = useMemo(() => {
    const locCounts = jobs.reduce((acc, job) => {
      const loc = job.location || 'Khác';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedLocs = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a]);
    return ['Tất cả', ...sortedLocs.slice(0, 4)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (activeTab !== 'Tất cả') {
      filtered = jobs.filter(j => j.location === activeTab);
    }
    return filtered.slice(0, 9); // Max 9 jobs
  }, [jobs, activeTab]);

  if (jobs.length === 0) {
    return (
      <SectionReveal className="mb-12">
        <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative h-28 md:h-32 bg-slate-900 px-6 md:px-10 flex items-center overflow-hidden">
            {bgImage && (
              <>
                <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-slate-950/40 z-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent z-0" />
              </>
            )}
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1 text-slate-300">{subtitle}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
            </div>
          </div>
          <div className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <img src="/images/empty-box-illustration.png" alt="Empty" className="w-32 h-32 object-contain opacity-80" />
            </div>
            <p className="text-slate-400 font-medium">Chưa có việc làm trong ngành này</p>
            <p className="text-sm text-slate-500 mt-1">Hãy quay lại sau hoặc tìm kiếm ngành nghề khác</p>
          </div>
        </div>
      </SectionReveal>
    );
  }

  return (
    <SectionReveal className="mb-12">
      <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Banner Header */}
        <div className="relative h-28 md:h-32 bg-slate-900 px-6 md:px-10 flex items-center justify-between overflow-hidden">
          
          {bgImage && (
            <>
              <div 
                className="absolute inset-0 z-0" 
                style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
              />
              <div className="absolute inset-0 bg-slate-950/40 z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent z-0" />
            </>
          )}

          {/* Banner Pattern/Noise overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1 text-slate-300">{subtitle}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
          </div>

          <div className="hidden md:flex relative z-10 w-48 h-full items-center justify-end opacity-20">
             <Briefcase className="w-32 h-32 absolute -right-6 -bottom-6 transform rotate-12 text-white" />
          </div>
        </div>

        {/* Filters and Jobs Body */}
        <div className="p-6 md:p-8">
          
          {/* Location Tabs Bar */}
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10 overflow-x-auto hide-scrollbar">
            {locations.map((loc) => {
              const isActive = activeTab === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setActiveTab(loc)}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 z-10 ${
                    isActive 
                      ? TAB_ACTIVE_COLORS[theme]
                      : `text-slate-300 bg-white/5 hover:bg-white/10 ${TAB_HOVER_COLORS[theme]}`
                  }`}
                >
                  {loc}
                  {isActive && (
                    <motion.div
                      layoutId={`tab-highlight-${title}`}
                      className={`absolute inset-0 rounded-full -z-10 ${TAB_ACTIVE_COLORS[theme]}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            <Link href="/jobs" className="ml-auto text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors pl-4">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <JobCard job={job} variant="glass" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                Không có việc làm nào ở khu vực này
              </div>
            )}
          </div>
          
        </div>
      </div>
    </SectionReveal>
  );
}
