'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  jobSkills: string[];
}

export default function MatchingScoreIndicator({ jobSkills }: Props) {
  const { user } = useAuthStore();
  const [score, setScore] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user?.role !== 'candidate' || !user?.candidateProfile?.skills) {
      setScore(null);
      return;
    }

    const userSkills = user.candidateProfile.skills.map(s => s.toLowerCase());
    const jSkills = jobSkills.map(s => s.toLowerCase());

    if (jSkills.length === 0) {
      setScore(100);
      return;
    }

    const matched = jSkills.filter(skill => userSkills.includes(skill));
    const percentage = Math.round((matched.length / jSkills.length) * 100);
    setScore(percentage);
  }, [user, jobSkills]);

  if (!isClient || score === null) return null;

  let colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let Icon = CheckCircle2;
  
  if (score < 50) {
    colorClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    Icon = AlertCircle;
  } else if (score < 80) {
    colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${colorClass} animate-in fade-in zoom-in duration-500`}>
      <div className="relative flex items-center justify-center w-10 h-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-current opacity-20"
            strokeDasharray="100, 100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <path
            className="text-current transition-all duration-1000 ease-out"
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-current">{score}%</span>
      </div>
      <div>
        <div className="text-sm font-bold text-current leading-tight">Độ phù hợp AI</div>
        <div className="text-xs text-current/80 font-medium">So với hồ sơ của bạn</div>
      </div>
    </div>
  );
}
