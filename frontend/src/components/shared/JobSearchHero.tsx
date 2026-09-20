'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function JobSearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [keyword, setKeyword] = useState(searchParams.get('skills') || searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    setKeyword(searchParams.get('skills') || searchParams.get('keyword') || '');
    setLocation(searchParams.get('location') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    // Clear both first
    newSearchParams.delete('keyword');
    newSearchParams.delete('skills');

    if (keyword) {
      // Use skills for AI matching
      newSearchParams.set('skills', keyword);
    }
    
    if (location) {
      newSearchParams.set('location', location);
    } else {
      newSearchParams.delete('location');
    }
    
    newSearchParams.set('page', '1');
    router.push(`/jobs?${newSearchParams.toString()}`);
  };

  return (
    <div className="relative w-full bg-slate-900 pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: 'url("/images/jobs-bg.jpg")' }}
      />
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight"
        >
          Khám phá <span className="text-primary">việc làm IT</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10"
        >
          Tìm kiếm cơ hội nghề nghiệp phù hợp với kỹ năng và định hướng của bạn trong môi trường công nghệ hiện đại.
        </motion.p>
        
        {/* Floating Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form 
            onSubmit={handleSearch} 
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl md:rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-2 max-w-4xl mx-auto"
          >
            <div className="flex-1 relative flex items-center bg-white/5 md:bg-transparent rounded-xl md:rounded-none px-4 py-2 md:py-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <Input 
                placeholder="Tên công việc, kỹ năng (VD: ReactJS, Python)..." 
                className="border-0 bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/20 self-center" />
            
            <div className="flex-1 relative flex items-center bg-white/5 md:bg-transparent rounded-xl md:rounded-none px-4 py-2 md:py-0">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <Input 
                placeholder="Địa điểm (VD: Hồ Chí Minh)" 
                className="border-0 bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg"
              className="rounded-xl md:rounded-full px-8 text-base font-semibold shadow-[0_0_15px_rgba(var(--primary),0.5)] bg-primary hover:bg-primary/90 text-primary-foreground mt-2 md:mt-0"
            >
              Tìm kiếm
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
