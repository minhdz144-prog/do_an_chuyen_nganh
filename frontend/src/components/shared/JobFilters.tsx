'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Keyword & Location are now handled by JobSearchHero, but we must preserve them when applying filters
  const keyword = searchParams.get('keyword');
  const location = searchParams.get('location');
  
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [salaryRange, setSalaryRange] = useState<number[]>([
    Number(searchParams.get('salaryMin')) || 0,
    Number(searchParams.get('salaryMax')) || 10000
  ]);

  // Sync state when URL changes
  useEffect(() => {
    setJobType(searchParams.get('jobType') || 'all');
    setLevel(searchParams.get('level') || 'all');
    setSalaryRange([
      Number(searchParams.get('salaryMin')) || 0,
      Number(searchParams.get('salaryMax')) || 10000
    ]);
  }, [searchParams]);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'all' || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      
      // Reset page to 1 when filters change
      newSearchParams.set('page', '1');
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const applyFilters = (newParams: Record<string, string | null>) => {
    // preserve keyword and location
    if (keyword) newParams.keyword = keyword;
    if (location) newParams.location = location;
    
    const queryString = createQueryString(newParams);
    router.push(`/jobs?${queryString}`, { scroll: false });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'jobType') setJobType(value);
    if (name === 'level') setLevel(value);
    
    applyFilters({
      [name]: value,
      salaryMin: salaryRange[0] > 0 ? salaryRange[0].toString() : null,
      salaryMax: salaryRange[1] < 10000 ? salaryRange[1].toString() : null,
    });
  };

  const handleSalaryCommit = (value: number[]) => {
    applyFilters({
      jobType,
      level,
      salaryMin: value[0] > 0 ? value[0].toString() : null,
      salaryMax: value[1] < 10000 ? value[1].toString() : null,
    });
  };

  const clearAll = () => {
    setJobType('all');
    setLevel('all');
    setSalaryRange([0, 10000]);
    
    const newParams: Record<string, string | null> = {
      jobType: null,
      level: null,
      salaryMin: null,
      salaryMax: null,
    };
    if (keyword) newParams.keyword = keyword;
    if (location) newParams.location = location;
    
    const queryString = createQueryString(newParams);
    router.push(`/jobs?${queryString}`, { scroll: false });
  };

  const hasActiveFilters = jobType !== 'all' || level !== 'all' || salaryRange[0] > 0 || salaryRange[1] < 10000;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 md:sticky md:top-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h3 className="font-bold flex items-center gap-2 text-foreground">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Lọc nâng cao
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="h-8 text-xs text-muted-foreground hover:text-destructive px-2"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Xóa lọc
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Job Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground block">Loại hình làm việc</label>
          <Select value={jobType} onValueChange={(val: any) => handleSelectChange('jobType', val)}>
            <SelectTrigger className="w-full bg-muted/50">
              <SelectValue placeholder="Tất cả loại hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              <SelectItem value="full-time">Toàn thời gian</SelectItem>
              <SelectItem value="part-time">Bán thời gian</SelectItem>
              <SelectItem value="remote">Từ xa</SelectItem>
              <SelectItem value="internship">Thực tập</SelectItem>
              <SelectItem value="contract">Hợp đồng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground block">Cấp bậc</label>
          <Select value={level} onValueChange={(val: any) => handleSelectChange('level', val)}>
            <SelectTrigger className="w-full bg-muted/50">
              <SelectValue placeholder="Tất cả cấp bậc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp bậc</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead/Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Salary */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-foreground block">Mức lương (USD)</label>
          </div>
          
          <Slider
            min={0}
            max={10000}
            step={500}
            value={salaryRange}
            onValueChange={(val: any) => setSalaryRange(val)}
            onValueCommitted={(val: any) => handleSalaryCommit(val)}
            className="py-2"
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="bg-muted px-3 py-1.5 rounded-lg text-xs font-medium w-[45%] text-center border border-border">
              ${salaryRange[0].toLocaleString('vi-VN')}
            </div>
            <span className="text-muted-foreground text-sm">-</span>
            <div className="bg-muted px-3 py-1.5 rounded-lg text-xs font-medium w-[45%] text-center border border-border">
              ${salaryRange[1].toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
