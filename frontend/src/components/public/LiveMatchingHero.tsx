'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X, Search, Briefcase, MapPin, ChevronDown, Users, Building2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/lib/axios';
import ParticleNetwork from '@/components/shared/ParticleNetwork';

const QUICK_CATEGORIES = [
  'IT Phần mềm',
  'Kinh doanh / Bán hàng',
  'Marketing / Truyền thông',
  'Kế toán / Kiểm toán',
  'Hành chính / Nhân sự',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LiveMatchingHero({ 
  totalJobs = 0,
  totalCompanies = 0,
  totalCandidates = 0 
}: { 
  totalJobs?: number;
  totalCompanies?: number;
  totalCandidates?: number;
}) {
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [location, setLocation] = useState('all');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (skills.length === 0) { setMatchCount(null); return; }
    const fetchMatches = async () => {
      setIsSearching(true);
      try {
        const query = skills.join(',');
        const res: any = await axiosInstance.get(`/jobs/match-preview?skills=${query}`);
        setMatchCount(res.data.count);
      } catch { /* ignore */ } finally { setIsSearching(false); }
    };
    const timer = setTimeout(fetchMatches, 300);
    return () => clearTimeout(timer);
  }, [skills]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(inputValue); }
  };

  const addSkill = (val: string) => {
    const t = val.trim();
    if (t && !skills.includes(t)) setSkills([...skills, t]);
    setInputValue('');
  };

  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

  return (
    <section className="relative bg-slate-950 text-slate-50 py-28 md:py-36 px-6 overflow-hidden">
      {/* ★ Background Image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Hero background"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
        quality={80}
      />
      {/* Multi-layer overlays for readability */}
      <div className="absolute inset-0 bg-slate-950/75 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/90 z-[1]" />

      {/* ★ Animated Particle Network — neural network / AI vibe */}
      <ParticleNetwork
        particleCount={70}
        connectionDistance={150}
        particleColor="16, 185, 129"
        lineColor="99, 102, 241"
        speed={0.25}
      />

      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-[pulse_6s_ease-in-out_infinite] z-[2]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-[pulse_8s_ease-in-out_infinite_1s] z-[2]" />
      {/* Decorative rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none z-[2]">
        {[0.2, 0.4, 0.6, 0.8].map(s => (
          <div key={s} className="absolute inset-0 border border-white rounded-full" style={{ transform: `scale(${s})` }} />
        ))}
      </div>

      <motion.div
        className="max-w-5xl mx-auto text-center space-y-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}
        <motion.div variants={itemVariants} className="space-y-6">
          
          {/* ★ Floating PRO Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-200">
                <span className="text-emerald-400">IT Job Portal</span> — Nền tảng tuyển dụng AI số 1
              </span>
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Ứng viên chất —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              Doanh nghiệp hàng đầu
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
            Nhập kỹ năng của bạn để trải nghiệm{' '}
            <span className="font-semibold text-emerald-400">AI Live Matching</span> ngay lập tức
          </p>
        </motion.div>

        {/* Giant Search Bar */}
        <motion.div
          variants={itemVariants}
          className="max-w-4xl mx-auto bg-white rounded-full p-2.5 shadow-2xl flex flex-col md:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-3 px-4 w-full md:w-auto">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="flex-1 flex flex-wrap gap-2 items-center overflow-x-auto custom-scrollbar py-1">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue && addSkill(inputValue)}
                placeholder={skills.length === 0 ? 'Tìm kiếm theo tên vị trí, kỹ năng...' : 'Thêm kỹ năng...'}
                className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 shadow-none h-10 p-0 text-slate-900 placeholder:text-slate-400 bg-transparent text-base"
              />
            </div>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-slate-200" />

          <div className="flex items-center px-2 w-full md:w-48 border-t md:border-t-0 border-slate-100 py-2 md:py-0 transition-colors relative group">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-4 z-10 group-hover:text-primary transition-colors" />
            <Select value={location} onValueChange={(val: any) => setLocation(val)}>
              <SelectTrigger className="w-full border-0 shadow-none focus:ring-0 pl-9 bg-transparent text-slate-600 hover:bg-slate-50 rounded-full h-10 transition-colors">
                <SelectValue placeholder="Tất cả địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button — Framer Motion glow */}
          <motion.button
            onClick={() => {
              const params = new URLSearchParams();
              // Combine existing skills with whatever is currently in the input
              const finalSkills = [...skills];
              if (inputValue.trim()) {
                const newSkills = inputValue.split(',').map(s => s.trim()).filter(s => s);
                newSkills.forEach(s => {
                  if (!finalSkills.includes(s)) finalSkills.push(s);
                });
              }
              
              if (finalSkills.length > 0) params.set('skills', finalSkills.join(','));
              if (location && location !== 'all') params.set('location', location);
              window.location.href = `/jobs?${params.toString()}`;
            }}
            className="w-full md:w-auto bg-primary text-white rounded-full px-10 py-3.5 text-lg font-semibold shrink-0 outline-none"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 28px 6px rgba(16,185,129,0.45)',
              filter: 'brightness(1.1)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            Tìm kiếm
          </motion.button>
        </motion.div>

        {/* Live Matching Status */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-slate-300 h-8">
          {skills.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <div className="text-sm font-medium">
                {isSearching ? (
                  <span className="animate-pulse text-emerald-400">Đang phân tích AI...</span>
                ) : matchCount !== null ? (
                  <span>
                    Tìm thấy <strong className="text-white text-base font-bold mx-1">{matchCount}</strong> việc làm phù hợp
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Category Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
          {QUICK_CATEGORIES.map((cat, idx) => (
            <motion.a
              key={idx}
              href={`/jobs?keyword=${encodeURIComponent(cat)}`}
              className="px-5 py-2 rounded-full bg-slate-900/40 border border-slate-800/50 text-slate-300 text-sm font-medium backdrop-blur-sm"
              whileHover={{
                backgroundColor: 'rgba(30,41,59,0.8)',
                color: '#fff',
                borderColor: 'rgba(16,185,129,0.4)',
                scale: 1.04,
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              {cat}
            </motion.a>
          ))}
        </motion.div>

        {/* ★ Live Stats Counter Bar — glassmorphism */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-6 md:gap-12 mt-4"
        >
          {[
            { icon: Briefcase, value: totalJobs > 0 ? totalJobs : '500+', label: 'Việc làm đang mở' },
            { icon: Building2, value: totalCompanies > 0 ? totalCompanies : '200+', label: 'Công ty đối tác' },
            { icon: Users, value: totalCandidates > 0 ? totalCandidates : '10K+', label: 'Ứng viên' },
            { icon: TrendingUp, value: '95%', label: 'Tỷ lệ phản hồi' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
