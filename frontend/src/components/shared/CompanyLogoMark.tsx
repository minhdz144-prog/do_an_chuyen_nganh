'use client';

import {
  Shield, Cpu, Database, Network, Palette,
  Megaphone, Code2, Building2, type LucideIcon,
} from 'lucide-react';

const PALETTE = [
  'bg-[#EA580C]', // cam
  'bg-[#16A34A]', // xanh lá
  'bg-[#4F46E5]', // indigo
  'bg-[#0891B2]', // teal
  'bg-[#9333EA]', // tím
  'bg-[#DC2626]', // đỏ
];

function hashColor(name: string) {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function iconForIndustry(industry: string): LucideIcon {
  const s = industry.toLowerCase();
  if (s.includes('security') || s.includes('an ninh') || s.includes('bảo mật')) return Shield;
  if (s.includes('phần cứng') || s.includes('hardware')) return Cpu;
  if (s.includes('data') || s.includes('ai')) return Database;
  if (s.includes('mạng') || s.includes('network') || s.includes('hệ thống')) return Network;
  if (s.includes('design') || s.includes('ui') || s.includes('ux') || s.includes('thiết kế')) return Palette;
  if (s.includes('marketing')) return Megaphone;
  if (s.includes('phần mềm') || s.includes('software') || s.includes('app')) return Code2;
  return Building2;
}

interface CompanyLogoMarkProps {
  name: string;
  industry?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: { box: 'w-8 h-8', icon: 16 }, // Adjusted to match Trust Bar size
  md: { box: 'w-12 h-12', icon: 20 }, // Adjusted to match JobCard size
  lg: { box: 'w-20 h-20', icon: 36 }, // Adjusted to match Job detail sidebar sizes
  xl: { box: 'w-24 h-24 md:w-32 md:h-32', icon: 48 }, // For Company Profile Hero
};

export default function CompanyLogoMark({
  name, industry = '', logoUrl, size = 'md', className = ''
}: CompanyLogoMarkProps) {
  const { box, icon: iconSize } = SIZE_MAP[size];

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={name} className={`${box} rounded-full object-contain bg-white border border-slate-100 p-1 shrink-0 ${className}`} />
    );
  }

  const Icon = iconForIndustry(industry);
  return (
    <div className={`${box} rounded-full ${hashColor(name)} flex items-center justify-center shrink-0 ${className}`}>
      <Icon size={iconSize} className="text-white" strokeWidth={2} />
    </div>
  );
}
