'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import CompanyLogoMark from './CompanyLogoMark';

interface Company {
  _id: string;
  name: string;
  industry?: string;
  logo?: string;
}

interface CompanyMarqueeProps {
  companies: Company[];
}

export default function CompanyMarquee({ companies }: CompanyMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  if (!companies || companies.length === 0) return null;

  // Duplicate 4x to ensure seamless looping
  const loop = [...companies, ...companies, ...companies, ...companies];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <style>{`
        @keyframes marquee-fwd  { 0% { transform: translateX(0); }  100% { transform: translateX(-50%); } }
        @keyframes marquee-rev  { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-fwd { animation: marquee-fwd  32s linear infinite; }
        .marquee-rev { animation: marquee-rev  38s linear infinite; }
        .marquee-fwd:hover,
        .marquee-rev:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-fwd, .marquee-rev { animation: none; }
        }
      `}</style>

      {/* Row 1 — forward */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] mb-4">
        <div className="marquee-fwd flex gap-6 w-max">
          {loop.map((c, i) => (
            <MarqueeItem key={`fwd-${c._id}-${i}`} company={c} />
          ))}
        </div>
      </div>

      {/* Row 2 — reverse (odd companies only for variety) */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee-rev flex gap-6 w-max">
          {[...loop].reverse().map((c, i) => (
            <MarqueeItem key={`rev-${c._id}-${i}`} company={c} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MarqueeItem({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company._id}`}
      className="shrink-0 group"
    >
      <motion.div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm group-hover:bg-white/10 transition-colors"
        whileHover={{
          scale: 1.06,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          borderColor: 'rgba(16,185,129,0.5)',
          y: -2,
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <div className="relative">
          <CompanyLogoMark 
            name={company.name} 
            industry={company.industry} 
            logoUrl={company.logo}
            size="sm"
            className="border-none bg-white p-1"
          />
          {/* Status Dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#0f172a]"></span>
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-200 whitespace-nowrap group-hover:text-white transition-colors">
          {company.name}
        </span>
      </motion.div>
    </Link>
  );
}
