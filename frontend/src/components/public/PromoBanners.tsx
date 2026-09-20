'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    image: '/images/promo1.jpg',
    title: 'Chiến dịch IT Hiring 2026',
    subtitle: 'Hàng trăm vị trí Senior từ các tập đoàn công nghệ hàng đầu — Cơ hội thăng tiến sự nghiệp không giới hạn',
    cta: 'Khám phá ngay',
    link: '/jobs',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    id: 2,
    image: '/images/promo2.jpg',
    title: 'Tech Career Fair — Cơ hội vàng',
    subtitle: 'Kết nối trực tiếp với nhà tuyển dụng hàng đầu — Thay đổi sự nghiệp trong 1 ngày',
    cta: 'Tìm hiểu thêm',
    link: '/jobs',
    accent: 'from-indigo-500 to-purple-400',
  },
  {
    id: 3,
    image: '/images/promo3.jpg',
    title: 'Startup & Công nghệ tuyển gấp',
    subtitle: 'Môi trường làm việc trẻ trung, năng động — Lương cạnh tranh & cổ phần hấp dẫn',
    cta: 'Xem việc làm',
    link: '/jobs?jobType=full-time',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    id: 4,
    image: '/images/promo4.jpg',
    title: 'Remote & Hybrid — Xu thế 2026',
    subtitle: 'Làm việc từ bất cứ đâu với hàng nghìn cơ hội Remote từ các công ty quốc tế',
    cta: 'Tìm việc Remote',
    link: '/jobs?jobType=remote',
    accent: 'from-sky-500 to-cyan-400',
  },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.45, ease: [0.55, 0, 0.78, 0] as const },
  }),
};

export default function PromoBanners() {
  const [[currentIndex, direction], setCurrent] = useState([0, 0]);

  const paginate = useCallback((newDir: number) => {
    setCurrent(([prev]) => [
      (prev + newDir + BANNERS.length) % BANNERS.length,
      newDir,
    ]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [paginate]);

  const banner = BANNERS[currentIndex];

  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden shadow-2xl group"
           style={{ height: 'clamp(300px, 40vw, 500px)' }}>
        
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 cursor-pointer"
            onClick={() => (window.location.href = banner.link)}
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            {/* Multi-layer gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Content */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
            >
              {/* Tag label */}
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${banner.accent} text-white mb-4 shadow-lg`}>
                {banner.id === 1 ? '🔥 HOT' : banner.id === 2 ? '⭐ SỰ KIỆN' : banner.id === 3 ? '🚀 STARTUP' : '🌍 REMOTE'}
              </span>
              
              <h3 className="text-white font-extrabold text-2xl md:text-4xl drop-shadow-lg mb-3 leading-tight max-w-xl">
                {banner.title}
              </h3>
              <p className="text-white/70 text-sm md:text-base mb-6 max-w-md hidden sm:block leading-relaxed">
                {banner.subtitle}
              </p>
              <motion.span
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${banner.accent} text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-lg`}
                whileHover={{ scale: 1.06, boxShadow: '0 0 20px rgba(255,255,255,0.25)' }}
                whileTap={{ scale: 0.97 }}
              >
                {banner.cta} →
              </motion.span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {[{ dir: -1, pos: 'left-4', Icon: ChevronLeft }, { dir: 1, pos: 'right-4', Icon: ChevronRight }].map(({ dir, pos, Icon }) => (
          <motion.button
            key={dir}
            onClick={(e) => { e.stopPropagation(); paginate(dir); }}
            className={`absolute ${pos} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10`}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.93 }}
          >
            <Icon className="w-5 h-5" />
          </motion.button>
        ))}

        {/* Progress bar + dot indicators */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
          {BANNERS.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrent([idx, idx > currentIndex ? 1 : -1])}
              className="relative h-1.5 rounded-full bg-white/30 overflow-hidden"
              animate={{
                width: idx === currentIndex ? 32 : 8,
              }}
              transition={{ duration: 0.3 }}
            >
              {idx === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute top-4 right-6 z-10 bg-black/40 backdrop-blur-md text-white/80 text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
          {currentIndex + 1} / {BANNERS.length}
        </div>
      </div>
    </section>
  );
}
