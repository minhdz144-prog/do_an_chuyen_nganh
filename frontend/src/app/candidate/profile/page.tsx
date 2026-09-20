'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Mail, MapPin, Phone, GraduationCap, Briefcase, Upload, FileText } from 'lucide-react';
import AICareerPathDialog from '@/components/candidate/AICareerPathDialog';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Năm kinh nghiệm không hợp lệ'),
  educationLevel: z.enum(['high_school', 'college', 'bachelor', 'master', 'phd']).optional().or(z.literal('')),
  skillsString: z.string().optional(),
  resumeUrl: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CandidateProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSuggestingPath, setIsSuggestingPath] = useState(false);
  const [careerPathData, setCareerPathData] = useState<any>(null);
  const [isCareerPathDialogOpen, setIsCareerPathDialogOpen] = useState(false);

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

  const formValues = watch();

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

      const res = await authApi.updateMe(payload);
      updateUser(res.data.user as any);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
    } catch (error: any) {
      setErrorMsg(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  const handleSuggestCareerPath = async () => {
    const currentSkillsStr = watch('skillsString') || '';
    const skillsList = currentSkillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    
    if (skillsList.length === 0) {
      setErrorMsg('Vui lòng nhập ít nhất một kỹ năng trước khi nhận gợi ý lộ trình.');
      return;
    }

    try {
      setIsSuggestingPath(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res: any = await axiosInstance.post('/ai/career-path', { candidateSkills: skillsList });
      if (res.success) {
        setCareerPathData(res.data.path);
        setIsCareerPathDialogOpen(true);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Lỗi khi gợi ý lộ trình. Vui lòng thử lại.');
    } finally {
      setIsSuggestingPath(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File quá lớn (tối đa 5MB)');
      return;
    }

    try {
      setIsUploadingCV(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('resume', file);

      const res: any = await axiosInstance.post('/uploads/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // auto-fill the URL
      const fileUrl = res.data?.url;
      if (fileUrl) setValue('resumeUrl', fileUrl, { shouldDirty: true });

      // auto-fill skills
      if (res.data?.extractedSkills && res.data.extractedSkills.length > 0) {
        const currentSkillsStr = watch('skillsString') || '';
        const currentSkills = currentSkillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        
        const newSkills = res.data.extractedSkills.filter((s: string) => !currentSkills.some((cs: string) => cs.toLowerCase() === s.toLowerCase()));
        
        if (newSkills.length > 0) {
          const merged = [...currentSkills, ...newSkills].join(', ');
          setValue('skillsString', merged, { shouldDirty: true });
          setSuccessMsg(`Đã phân tích CV thành công! Trí tuệ nhân tạo (AI) đã tìm thấy và tự động điền thêm ${newSkills.length} kỹ năng mới.`);
        } else {
          setSuccessMsg('Tải CV thành công! AI không tìm thấy kỹ năng nào mới ngoài các kỹ năng bạn đã điền.');
        }
      } else {
        setSuccessMsg('Tải CV thành công! (Không tìm thấy kỹ năng IT nào trong CV)');
      }

    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi tải CV lên.');
    } finally {
      setIsUploadingCV(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* Form Section */}
      <div className="xl:col-span-7 space-y-6 print-hidden">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Hồ sơ Ứng viên</h1>
            <p className="text-muted-foreground">
              Hãy cập nhật đầy đủ thông tin kỹ năng để AI có thể gợi ý việc làm chính xác nhất cho bạn.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và Tên <span className="text-destructive">*</span></Label>
                  <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : 'bg-background'} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" {...register('phone')} className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa chỉ / Khu vực làm việc</Label>
                  <Input id="location" placeholder="VD: TP.HCM" {...register('location')} className="bg-background" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Link CV / Portfolio (URL)</Label>
                  <div className="flex gap-2">
                    <Input id="resumeUrl" placeholder="https://..." {...register('resumeUrl')} className={`flex-1 ${errors.resumeUrl ? 'border-destructive' : 'bg-background'}`} />
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="shrink-0 gap-2 text-primary border-primary/20 hover:bg-primary/10 bg-primary/5"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCV}
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingCV ? 'Đang đọc CV...' : 'Tải lên CV (AI)'}
                    </Button>
                  </div>
                  {errors.resumeUrl && <p className="text-xs text-destructive">{errors.resumeUrl.message as string}</p>}
                  <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">
                    * Mẹo: Tải file CV PDF lên để AI tự động trích xuất kỹ năng
                  </p>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Năm kinh nghiệm</Label>
                    <Input id="yearsOfExperience" type="number" min="0" step="0.5" {...register('yearsOfExperience')} className="bg-background" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bằng cấp</Label>
                    <Select 
                      value={watch('educationLevel') || ''} 
                      onValueChange={(val: any) => setValue('educationLevel', val)}
                    >
                      <SelectTrigger className="bg-background">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skillsString">Kỹ năng (cách nhau bằng dấu phẩy)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleSuggestCareerPath}
                      disabled={isSuggestingPath}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 h-7 text-[11px] px-2"
                    >
                      {isSuggestingPath ? 'Đang phân tích...' : '✨ AI Phân Tích Lộ Trình'}
                    </Button>
                  </div>
                  <Textarea 
                    id="skillsString" 
                    placeholder="React, Node.js, TypeScript, Docker..." 
                    className="h-[120px] resize-none bg-background"
                    {...register('skillsString')}
                  />
                  <p className="text-xs text-muted-foreground">Thuật toán Matching AI sẽ dựa vào các kỹ năng này.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu bản thân (Bio)</Label>
              <Textarea 
                id="bio" 
                placeholder="Viết một đoạn ngắn gọn giới thiệu về định hướng và điểm mạnh của bạn..." 
                className="h-[100px] bg-background"
                {...register('bio')}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all rounded-xl"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Resume Preview Section */}
      <div className="xl:col-span-5 relative">
        <div className="sticky top-24">
          <div className="flex justify-between items-end mb-4 print-hidden">
            <h2 className="text-lg font-bold text-foreground">Bản xem trước CV</h2>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 text-primary border-primary/20 hover:bg-primary/10 rounded-lg"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Xuất PDF
            </Button>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              /* Ẩn Navbar, Footer, Sidebar (nếu có) */
              header, footer, nav, aside, .print-hidden {
                display: none !important;
              }
              /* Reset Grid/Flex của layout chính để nó chiếm toàn trang */
              main, .grid {
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
              }
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #cv-preview-container {
                box-shadow: none !important;
                margin: 0 auto !important;
                width: 100% !important;
                border: none !important;
              }
              @page { size: A4 portrait; margin: 10mm; }
            }
          `}} />
          <div id="cv-preview-container" className="w-full aspect-[1/1.414] bg-white rounded-md shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col text-slate-800 scale-100 transform origin-top transition-all">
            <header className="border-b-2 border-slate-200 pb-4 mb-4">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">{formValues.name || 'HỌ VÀ TÊN'}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[10px] sm:text-xs text-slate-600">
                <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                {formValues.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {formValues.phone}</div>}
                {formValues.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {formValues.location}</div>}
              </div>
            </header>

            <div className="flex-1 space-y-5 overflow-hidden text-[10px] sm:text-xs">
              {formValues.bio && (
                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-2 border-emerald-500 pl-2">Tóm tắt</h3>
                  <p className="text-slate-700 leading-relaxed break-words line-clamp-4">{formValues.bio}</p>
                </section>
              )}

              <section>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-2 border-emerald-500 pl-2">Học vấn & Kinh nghiệm</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                      <Briefcase className="w-3.5 h-3.5" /> Năm kinh nghiệm
                    </div>
                    <p className="text-slate-600 pl-5">{formValues.yearsOfExperience || 0} năm</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                      <GraduationCap className="w-3.5 h-3.5" /> Bằng cấp
                    </div>
                    <p className="text-slate-600 pl-5">{formValues.educationLevel ? formValues.educationLevel.toUpperCase() : 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-2 border-emerald-500 pl-2">Kỹ năng chuyên môn</h3>
                <div className="flex flex-wrap gap-1.5">
                  {formValues.skillsString 
                    ? formValues.skillsString.split(',').map((s: string, i: number) => s.trim() && (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {s.trim()}
                      </span>
                    ))
                    : <span className="text-slate-400 italic">Chưa thêm kỹ năng</span>
                  }
                </div>
              </section>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100 text-[9px] text-center text-slate-400">
               Tạo bởi IT JobPortal Resume Builder
            </div>
          </div>
        </div>
      </div>

      <AICareerPathDialog 
        isOpen={isCareerPathDialogOpen}
        onClose={() => setIsCareerPathDialogOpen(false)}
        pathData={careerPathData}
      />
    </div>
  );
}
