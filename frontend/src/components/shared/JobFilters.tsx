'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');

  // Sync state when URL changes (e.g. user clicks browser back button)
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setLocation(searchParams.get('location') || '');
    setJobType(searchParams.get('jobType') || 'all');
    setLevel(searchParams.get('level') || 'all');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = createQueryString({
      keyword,
      location,
      jobType,
      level
    });
    router.push(`/jobs?${queryString}`);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'jobType') setJobType(value);
    if (name === 'level') setLevel(value);
    
    const queryString = createQueryString({
      keyword,
      location,
      [name]: value
    });
    router.push(`/jobs?${queryString}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Tên công việc, kỹ năng..." 
          className="pl-9 bg-slate-50 border-slate-200"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Input 
          placeholder="Địa điểm (VD: Hồ Chí Minh)" 
          className="bg-slate-50 border-slate-200"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="w-full md:w-48">
        <Select value={jobType} onValueChange={(val: any) => handleSelectChange('jobType', val)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Loại hình" />
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
      <div className="w-full md:w-48">
        <Select value={level} onValueChange={(val: any) => handleSelectChange('level', val)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Cấp bậc" />
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
      <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white md:w-auto w-full">
        Tìm kiếm
      </Button>
    </form>
  );
}
