'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

const jobSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  location: z.string().min(2, 'Vui lòng nhập địa điểm làm việc'),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship', 'contract']),
  level: z.enum(['intern', 'fresher', 'junior', 'middle', 'senior', 'lead']),
  deadline: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export default function JobForm({ mode, initialData, onSubmit, isSubmitting = false }: JobFormProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [isGeneratingJD, setIsGeneratingJD] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      salaryMin: initialData?.salary?.min || 0,
      salaryMax: initialData?.salary?.max || 0,
      jobType: initialData?.jobType || 'full-time',
      level: initialData?.level || 'junior',
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
    }
  });

  useEffect(() => {
    if (initialData?.requiredSkills) {
      setSkills(initialData.requiredSkills);
    }
  }, [initialData]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
        setSkillInput('');
        setSkillsError('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleGenerateJD = async () => {
    const title = watch('title');
    if (!title || title.length < 5) {
      toast.error('Vui lòng nhập Tiêu đề công việc trước khi nhờ AI viết.');
      return;
    }
    if (skills.length === 0) {
      toast.error('Vui lòng nhập Kỹ năng yêu cầu trước khi nhờ AI viết.');
      return;
    }

    try {
      setIsGeneratingJD(true);
      const res: any = await axiosInstance.post('/ai/job-description', {
        title,
        skills
      });
      if (res.success) {
        setValue('description', res.data.description, { shouldValidate: true });
        toast.success('Đã tự động điền Mô tả công việc bằng AI!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi khi sinh JD');
    } finally {
      setIsGeneratingJD(false);
    }
  };

  const handleFormSubmit = async (data: JobFormValues) => {
    if (skills.length === 0) {
      setSkillsError('Vui lòng nhập ít nhất 1 kỹ năng');
      return;
    }
    await onSubmit({
      ...data,
      requiredSkills: skills,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label>Tiêu đề công việc <span className="text-rose-500">*</span></Label>
          <Input {...register('title')} placeholder="VD: Senior Frontend Developer (React/Next.js)" />
          {errors.title && <p className="text-xs text-rose-500">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Loại hình <span className="text-rose-500">*</span></Label>
          <Select value={watch('jobType')} onValueChange={(val: any) => setValue('jobType', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Toàn thời gian</SelectItem>
              <SelectItem value="part-time">Bán thời gian</SelectItem>
              <SelectItem value="remote">Từ xa (Remote)</SelectItem>
              <SelectItem value="internship">Thực tập (Internship)</SelectItem>
              <SelectItem value="contract">Hợp đồng (Contract)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cấp bậc <span className="text-rose-500">*</span></Label>
          <Select value={watch('level')} onValueChange={(val: any) => setValue('level', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead/Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Địa điểm làm việc <span className="text-rose-500">*</span></Label>
          <Input {...register('location')} placeholder="VD: Quận 1, TP.HCM" />
          {errors.location && <p className="text-xs text-rose-500">{errors.location.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Hạn nộp hồ sơ</Label>
          <Input type="date" {...register('deadline')} />
        </div>

        <div className="space-y-2">
          <Label>Mức lương tối thiểu (USD)</Label>
          <Input type="number" {...register('salaryMin')} placeholder="VD: 500" />
        </div>

        <div className="space-y-2">
          <Label>Mức lương tối đa (USD)</Label>
          <Input type="number" {...register('salaryMax')} placeholder="VD: 1500" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Kỹ năng yêu cầu <span className="text-rose-500">*</span></Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-primary/90 hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <Input 
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="Nhập kỹ năng và nhấn Enter..." 
          />
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">Nhấn Enter để thêm kỹ năng mới</p>
          {skillsError && <p className="text-xs text-rose-500">{skillsError}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex justify-between items-center">
            <Label>Mô tả công việc (Yêu cầu, Quyền lợi, Trách nhiệm) <span className="text-rose-500">*</span></Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateJD} 
              disabled={isGeneratingJD} 
              className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 h-8 text-xs px-3"
            >
              {isGeneratingJD ? 'AI đang viết...' : '✨ AI Viết JD'}
            </Button>
          </div>
          <Textarea 
            {...register('description')} 
            placeholder="Nhập chi tiết mô tả công việc..." 
            className="h-40"
          />
          {errors.description && <p className="text-xs text-rose-500">{errors.description.message as string}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-4">
        <Link href="/employer/jobs">
          <Button type="button" variant="outline">Hủy bỏ</Button>
        </Link>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary text-white px-8"
        >
          {isSubmitting ? 'Đang xử lý...' : mode === 'create' ? 'Đăng tin tuyển dụng' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
}
