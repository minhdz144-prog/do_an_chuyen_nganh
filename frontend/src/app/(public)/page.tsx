import Link from 'next/link';
import { getJobs } from '@/lib/api/jobs';
import JobCard from '@/components/shared/JobCard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LiveMatchingHero from '@/components/public/LiveMatchingHero';
import PromoBanners from '@/components/public/PromoBanners';
import CompanyMarquee from '@/components/shared/CompanyMarquee';
import SectionReveal from '@/components/shared/SectionReveal';
import { CategoryJobsSection } from '@/components/public/CategoryJobsSection';
import LatestJobsSection from '@/components/public/LatestJobsSection';
import { Monitor, BriefcaseBusiness, Palette, Network, Megaphone, LineChart, Landmark, Package, Users, Building, Briefcase, ArrowRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export const revalidate = 60; // ISR cache 60s

// ★ 8 nhóm category — keyword để lọc job theo title/skills
const CATEGORIES = [
  { name: 'IT Phần mềm', icon: Monitor, keyword: 'Phần mềm', hue: 0 },
  { name: 'Kinh doanh / Bán lẻ', icon: BriefcaseBusiness, keyword: 'Kinh doanh', hue: 45 },
  { name: 'Tài chính / Ngân hàng', icon: Landmark, keyword: 'Tài chính', hue: 90 },
  { name: 'Sản xuất / Vận hành', icon: Package, keyword: 'Vận hành', hue: 135 },
  { name: 'Marketing / Truyền thông', icon: Megaphone, keyword: 'Marketing', hue: 180 },
  { name: 'Thiết kế / Sáng tạo', icon: Palette, keyword: 'Thiết kế', hue: 225 },
  { name: 'Kế toán / Kiểm toán', icon: LineChart, keyword: 'Kế toán', hue: 270 },
  { name: 'Viễn thông / Network', icon: Network, keyword: 'Viễn thông', hue: 315 },
];

export default async function HomePage() {
  const [jobsRes, statsRes, categoryRes] = await Promise.all([
    getJobs({ limit: '50' }).catch(() => ({ data: { jobs: [] } })),
    axiosInstance.get('/stats/public').catch(() => null),
    axiosInstance.get('/stats/categories').catch(() => null),
  ]);
  const jobsData = jobsRes?.data;
  const allJobs = jobsData?.jobs || [];
  const stats = (statsRes as any)?.data || { totalCandidates: 0, totalVerifiedCompanies: 0, totalActiveJobs: 0 };
  const categoryCounts: Record<string, number> = (categoryRes as any)?.data?.categoryCounts || {};

  const highSalaryJobs = [...allJobs]
    .sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0))
    .slice(0, 6);

  const latestJobs = [...allJobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const highSalaryIds = new Set(highSalaryJobs.map(j => j._id));
  const overlapCount = latestJobs.filter(j => highSalaryIds.has(j._id)).length;
  const showHighSalarySection = allJobs.length >= 10 && overlapCount < 4;

  const companiesMap = new Map();
  allJobs.forEach(job => {
    if (job.company && !companiesMap.has(job.company._id)) {
      companiesMap.set(job.company._id, job.company);
    }
  });
  const companies = Array.from(companiesMap.values()).filter(c => c.logo).slice(0, 8);
  const showTrustBar = companies.length >= 4;

  // ★ 8 nhóm nghề chuẩn TopCV Pro — bộ lọc keyword thông minh
  const CATEGORY_GROUPS = {
    it: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('developer') ||
      j.title?.toLowerCase().includes('engineer') ||
      j.title?.toLowerCase().includes('kỹ sư') ||
      j.title?.toLowerCase().includes('backend') ||
      j.title?.toLowerCase().includes('frontend') ||
      j.title?.toLowerCase().includes('fullstack') ||
      j.title?.toLowerCase().includes('devops') ||
      j.title?.toLowerCase().includes('data') ||
      j.title?.toLowerCase().includes('ai') ||
      j.title?.toLowerCase().includes('mobile') ||
      j.title?.toLowerCase().includes('phần mềm') ||
      j.title?.toLowerCase().includes('lập trình') ||
      (j.requiredSkills?.some(s => ['react', 'node', 'java', 'python', 'php', 'c#', '.net', 'typescript', 'flutter', 'sql', 'aws', 'docker'].includes(s.toLowerCase())))
    ),
    business: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('kinh doanh') ||
      j.title?.toLowerCase().includes('bán hàng') ||
      j.title?.toLowerCase().includes('sale') ||
      j.title?.toLowerCase().includes('account manager') ||
      j.title?.toLowerCase().includes('business') ||
      j.title?.toLowerCase().includes('tư vấn') ||
      j.title?.toLowerCase().includes('phát triển thị trường')
    ),
    marketing: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('marketing') ||
      j.title?.toLowerCase().includes('content') ||
      j.title?.toLowerCase().includes('seo') ||
      j.title?.toLowerCase().includes('brand') ||
      j.title?.toLowerCase().includes('digital') ||
      j.title?.toLowerCase().includes('social media') ||
      j.title?.toLowerCase().includes('truyền thông') ||
      j.title?.toLowerCase().includes('quảng cáo')
    ),
    finance: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('kế toán') ||
      j.title?.toLowerCase().includes('tài chính') ||
      j.title?.toLowerCase().includes('ngân hàng') ||
      j.title?.toLowerCase().includes('kiểm toán') ||
      j.title?.toLowerCase().includes('finance') ||
      j.title?.toLowerCase().includes('accountant') ||
      j.title?.toLowerCase().includes('thuế')
    ),
    design: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('thiết kế') ||
      j.title?.toLowerCase().includes('designer') ||
      j.title?.toLowerCase().includes('ui/ux') ||
      j.title?.toLowerCase().includes('graphic') ||
      j.title?.toLowerCase().includes('sáng tạo') ||
      j.title?.toLowerCase().includes('illustrator') ||
      j.title?.toLowerCase().includes('motion')
    ),
    hr: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('nhân sự') ||
      j.title?.toLowerCase().includes('hr') ||
      j.title?.toLowerCase().includes('hành chính') ||
      j.title?.toLowerCase().includes('tuyển dụng') ||
      j.title?.toLowerCase().includes('human resource') ||
      j.title?.toLowerCase().includes('c&b') ||
      j.title?.toLowerCase().includes('training')
    ),
    construction: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('xây dựng') ||
      j.title?.toLowerCase().includes('bất động sản') ||
      j.title?.toLowerCase().includes('kiến trúc') ||
      j.title?.toLowerCase().includes('cơ khí') ||
      j.title?.toLowerCase().includes('kỹ thuật') ||
      j.title?.toLowerCase().includes('construction') ||
      j.title?.toLowerCase().includes('real estate')
    ),
    education: (jobs: typeof allJobs) => jobs.filter(j =>
      j.title?.toLowerCase().includes('giáo dục') ||
      j.title?.toLowerCase().includes('giảng viên') ||
      j.title?.toLowerCase().includes('giáo viên') ||
      j.title?.toLowerCase().includes('đào tạo') ||
      j.title?.toLowerCase().includes('teacher') ||
      j.title?.toLowerCase().includes('education') ||
      j.title?.toLowerCase().includes('gia sư')
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Live Matching Hero */}
      <LiveMatchingHero 
        totalJobs={stats.totalActiveJobs} 
        totalCompanies={stats.totalVerifiedCompanies}
        totalCandidates={stats.totalCandidates}
      />

      {/* Promo Banners Slider */}
      <div className="bg-slate-50">
        <PromoBanners />
      </div>

      {/* 2. High Salary Jobs */}
      {showHighSalarySection && (
        <section className="bg-slate-950 py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <SectionReveal className="flex justify-between items-end mb-12 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
                  Việc làm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">HOT &amp; Lương Cao</span>
                </h2>
                <p className="text-lg text-slate-400">Nâng tầm sự nghiệp với loạt job xịn trên nền tảng</p>
              </div>
              <Link href="/jobs" className="group hidden md:flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highSalaryJobs.map((job, i) => (
                <SectionReveal key={`high-${job._id}`} delay={i * 0.08} direction="up">
                  <JobCard job={job} isPremium={true} />
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 & CTA. Top Brands and CTA — Merged Block */}
      <div className="relative border-y border-white/10 overflow-hidden">
        {/* Shared Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            backgroundImage: 'url("/images/brands-bg.jpg")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed' 
          }} 
        />
        <div className="absolute inset-0 bg-[#0f172a]/90 z-0 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141517] via-[#141517]/80 to-[#141517] z-0" />

        {showTrustBar && (
          <section className="relative py-24 border-b border-white/5 z-10">
            <div className="max-w-7xl mx-auto px-6">
            <SectionReveal className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Hơn 200+ Đối Tác Khẳng Định
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Thương hiệu tiêu biểu</h2>
              <p className="text-lg text-slate-400">Các tập đoàn công nghệ hàng đầu đang tuyển dụng trên hệ thống</p>
            </SectionReveal>
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
              <CompanyMarquee companies={companies} />
            </div>
            </div>
          </section>
        )}

        {/* ── CTA: Kêu gọi Ứng viên tạo CV & dùng AI ── */}
        <section className="relative py-24 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Column: Text & Buttons */}
              <div className="text-left">
                <SectionReveal>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6">
                    <img src="/images/icons/ai-matching.svg" className="w-4 h-4 brightness-0 invert" style={{ filter: 'brightness(0) saturate(100%) invert(70%) sepia(50%) saturate(1000%) hue-rotate(110deg)' }} alt="AI" />
                    Tích hợp AI thông minh
                  </div>
                </SectionReveal>
                
                <SectionReveal delay={0.1}>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                    Tạo CV ngay — Nhận gợi ý <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      việc làm từ AI
                    </span>
                  </h2>
                </SectionReveal>
                
                <SectionReveal delay={0.2}>
                  <p className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed">
                    Hệ thống AI Live Matching phân tích kỹ năng trong CV của bạn và tự động đối chiếu với hàng nghìn tin tuyển dụng để tìm ra công việc phù hợp nhất — chỉ trong vài giây.
                  </p>
                </SectionReveal>
                
                <SectionReveal delay={0.3}>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 w-full sm:w-auto"
                    >
                      <img src="/images/icons/resume.svg" className="w-5 h-5 brightness-0 invert" alt="CV" />
                      Tạo tài khoản miễn phí
                    </Link>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border-2 border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all hover:border-white/20 w-full sm:w-auto"
                    >
                      <img src="/images/icons/search.svg" className="w-5 h-5 brightness-0 invert" alt="Search" />
                      Khám phá việc làm
                    </Link>
                </div>
              </SectionReveal>

              {/* Trust indicators */}
              <SectionReveal delay={0.4}>
                <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400 font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    Miễn phí 100%
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    AI phân tích CV
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {stats.totalActiveJobs}+ việc làm
                  </span>
                </div>
              </SectionReveal>
            </div>

            {/* Right Column: Illustration */}
            <div className="relative hidden lg:block">
              <SectionReveal delay={0.3}>
                <div className="relative">
                  {/* Decorative background shape for the illustration */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-3xl transform rotate-3 scale-105 -z-10" />
                  <img 
                    src="/images/job-search-illustration.png" 
                    alt="AI Job Search" 
                    className="w-full h-auto object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                  />
                </div>
              </SectionReveal>
            </div>
            
          </div>
        </div>
        </section>
      </div>

      {/* 4. Category Jobs — 8 ngành nghề chuẩn TopCV Pro */}
      <section className="relative py-24 border-b border-white/5">
        {/* Background Image & Overlay */}
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

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <SectionReveal className="text-center mb-16 relative">
            {/* Glowing background effect for the title */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold mb-6">
              <Briefcase className="w-4 h-4" />
              Khám phá đa dạng lĩnh vực
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
              Việc làm theo <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Ngành nghề</span>
            </h2>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Khám phá hàng nghìn cơ hội việc làm được phân loại chuyên sâu theo 8 ngành nghề hot nhất thị trường hiện nay.
            </p>
          </SectionReveal>

          <CategoryJobsSection title="IT Phần mềm" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.it(allJobs)} theme="blue" bgImage="/images/cat-1.jpg" />
          <CategoryJobsSection title="Kinh doanh - Bán hàng" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.business(allJobs)} theme="amber" bgImage="/images/cat-2.jpg" />
          <CategoryJobsSection title="Marketing - Truyền thông" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.marketing(allJobs)} theme="purple" bgImage="/images/cat-3.jpg" />
          <CategoryJobsSection title="Kế toán - Tài chính - Ngân hàng" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.finance(allJobs)} theme="emerald" bgImage="/images/cat-4.jpg" />
          <CategoryJobsSection title="Thiết kế - Sáng tạo" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.design(allJobs)} theme="rose" bgImage="/images/cat-5.jpg" />
          <CategoryJobsSection title="Nhân sự - Hành chính" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.hr(allJobs)} theme="indigo" bgImage="/images/cat-6.jpg" />
          <CategoryJobsSection title="Xây dựng - Bất động sản" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.construction(allJobs)} theme="orange" bgImage="/images/cat-7.jpg" />
          <CategoryJobsSection title="Giáo dục - Đào tạo" subtitle="Nhóm nghề" jobs={CATEGORY_GROUPS.education(allJobs)} theme="teal" bgImage="/images/cat-8.jpg" />
        </div>
      </section>

      {/* 5. Latest Jobs — Premium Bento Grid */}
      <LatestJobsSection allJobs={allJobs} />
    </div>
  );
}
