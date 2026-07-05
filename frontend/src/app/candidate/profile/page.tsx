'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Năm kinh nghiệm không hợp lệ'),
  educationLevel: z.enum(['high_school', 'college', 'bachelor', 'master', 'phd']).optional().or(z.literal('')),
  skillsString: z.string().optional(),
  resumeUrl: z.string().url('Đường dẫn không hợp lệ').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CandidateProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Convert array to comma separated string for the form
  const initialSkills = user?.candidateProfile?.skills?.join(', ') || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.candidateProfile?.bio || '',
      location: user?.candidateProfile?.location || '',
      yearsOfExperience: user?.candidateProfile?.yearsOfExperience || 0,
      educationLevel: user?.candidateProfile?.educationLevel || '',
      skillsString: initialSkills,
      resumeUrl: user?.candidateProfile?.resumeUrl || '',
    }
  });

  // Khi user load xong từ Store (Persist)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.candidateProfile?.bio || '',
        location: user.candidateProfile?.location || '',
        yearsOfExperience: user.candidateProfile?.yearsOfExperience || 0,
        educationLevel: user.candidateProfile?.educationLevel || '',
        skillsString: user.candidateProfile?.skills?.join(', ') || '',
        resumeUrl: user.candidateProfile?.resumeUrl || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      
      // Chuyển string thành mảng và lọc các phần tử rỗng
      const skillsArray = data.skillsString
        ? data.skillsString.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const payload = {
        name: data.name,
        phone: data.phone,
        candidateProfile: {
          bio: data.bio,
          location: data.location,
          yearsOfExperience: data.yearsOfExperience,
          educationLevel: data.educationLevel || undefined,
          skills: skillsArray,
          resumeUrl: data.resumeUrl,
        }
      };

      const res: any = await axiosInstance.put('/users/me', payload);
      
      // Update global store
      updateUser(res.data.user);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
    } catch (error: any) {
      setErrorMsg(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Hồ sơ Ứng viên</h1>
        <p className="text-slate-500">
          Hãy cập nhật đầy đủ thông tin kỹ năng để AI có thể gợi ý việc làm chính xác nhất cho bạn.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và Tên <span className="text-rose-500">*</span></Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-rose-300' : ''} />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa chỉ / Khu vực làm việc</Label>
              <Input id="location" placeholder="VD: TP.HCM" {...register('location')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Link CV / Portfolio (URL)</Label>
              <Input id="resumeUrl" placeholder="https://..." {...register('resumeUrl')} className={errors.resumeUrl ? 'border-rose-300' : ''} />
              {errors.resumeUrl && <p className="text-xs text-rose-500">{errors.resumeUrl.message as string}</p>}
            </div>
          </div>

          {/* Cột 2 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Năm kinh nghiệm</Label>
                <Input id="yearsOfExperience" type="number" min="0" step="0.5" {...register('yearsOfExperience')} />
              </div>
              
              <div className="space-y-2">
                <Label>Bằng cấp</Label>
                <Select 
                  value={watch('educationLevel') || ''} 
                  onValueChange={(val: any) => setValue('educationLevel', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bằng cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">THPT</SelectItem>
                    <SelectItem value="college">Cao đẳng</SelectItem>
                    <SelectItem value="bachelor">Cử nhân (Đại học)</SelectItem>
                    <SelectItem value="master">Thạc sĩ</SelectItem>
                    <SelectItem value="phd">Tiến sĩ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillsString">Kỹ năng chuyên môn (cách nhau bằng dấu phẩy)</Label>
              <Textarea 
                id="skillsString" 
                placeholder="React, Node.js, TypeScript, Docker..." 
                className="h-[120px] resize-none"
                {...register('skillsString')}
              />
              <p className="text-xs text-slate-500">Thuật toán Matching AI sẽ dựa vào các kỹ năng này để tìm việc phù hợp.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Giới thiệu bản thân (Bio)</Label>
          <Textarea 
            id="bio" 
            placeholder="Viết một đoạn ngắn gọn giới thiệu về định hướng và điểm mạnh của bạn..." 
            className="h-[100px]"
            {...register('bio')}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
