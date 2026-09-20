'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  industry: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  size: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function EmployerCompanyPage() {
  const { user, updateUser } = useAuthStore();
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(companySchema),
  });

  // Fetch thông tin công ty hiện tại
  useEffect(() => {
    if (!user?.companyId) { setLoading(false); return; }

    const fetchCompany = async () => {
      try {
        const res: any = await axiosInstance.get(`/companies/${user.companyId}`);
        const company = res.data.company;
        setCompanyData(company);
        reset({
          name: company.name || '',
          industry: company.industry || '',
          location: company.location || '',
          description: company.description || '',
          website: company.website || '',
          size: company.size || '',
        });
      } catch (error) {
        console.error('Lỗi tải thông tin công ty:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [user?.companyId, reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
            setSuccessMsg('');
      const res: any = await axiosInstance.put(`/companies/${user?.companyId}`, data);
      setCompanyData(res.data.company);
      setSuccessMsg('Cập nhật hồ sơ công ty thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground dark:text-muted-foreground">Đang tải...</div>;

  if (!user?.companyId) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Chưa có hồ sơ công ty</h2>
        <p className="text-muted-foreground dark:text-muted-foreground">Hãy tạo hồ sơ công ty từ giao diện quản lý.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/employer/dashboard" className="text-muted-foreground/80 dark:text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hồ sơ công ty</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Thông tin hiển thị trên các tin tuyển dụng của bạn.</p>
        </div>
      </div>



      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Tên công ty <span className="text-rose-500">*</span></Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Lĩnh vực hoạt động</Label>
            <Input {...register('industry')} placeholder="VD: Software Development" />
          </div>

          <div className="space-y-2">
            <Label>Quy mô nhân sự</Label>
            <Select value={watch('size') || ''} onValueChange={(val: any) => setValue('size', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quy mô" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1 - 10 nhân viên</SelectItem>
                <SelectItem value="11-50">11 - 50 nhân viên</SelectItem>
                <SelectItem value="51-200">51 - 200 nhân viên</SelectItem>
                <SelectItem value="201-500">201 - 500 nhân viên</SelectItem>
                <SelectItem value="500+">500+ nhân viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Địa chỉ trụ sở</Label>
            <Input {...register('location')} placeholder="VD: Quận 1, TP.HCM" />
          </div>

          <div className="space-y-2">
            <Label>Website công ty</Label>
            <Input {...register('website')} placeholder="https://..." />
            {errors.website && <p className="text-xs text-rose-500">{errors.website.message as string}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Giới thiệu công ty</Label>
            <Textarea {...register('description')} className="h-32" placeholder="Mô tả về lĩnh vực, văn hóa công ty..." />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white hover:bg-slate-800 px-8">
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
