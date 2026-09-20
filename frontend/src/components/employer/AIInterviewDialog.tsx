'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Check, Brain, Target, Lightbulb, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface AIInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateSkills: string[];
  jobRequiredSkills: string[];
  jobTitle: string;
  candidateName: string;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; label: string; color: string }> = {
  matched_skill: { icon: Target, label: 'Kiểm tra kỹ năng', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  missing_skill: { icon: Lightbulb, label: 'Đánh giá tiềm năng', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  problem_solving: { icon: Brain, label: 'Tư duy giải quyết', color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function AIInterviewDialog({
  open,
  onOpenChange,
  candidateSkills,
  jobRequiredSkills,
  jobTitle,
  candidateName,
}: AIInterviewDialogProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res: any = await axiosInstance.post('/ai/interview-questions', {
        candidateSkills,
        jobRequiredSkills,
        jobTitle,
      });
      setQuestions(res.data?.questions || []);
      setGenerated(true);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi sinh câu hỏi AI');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Đã copy câu hỏi!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n\n');
    navigator.clipboard.writeText(allText);
    toast.success('Đã copy tất cả câu hỏi!');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) { setGenerated(false); setQuestions([]); } }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            AI Gợi ý Câu hỏi Phỏng vấn
          </DialogTitle>
          <DialogDescription>
            Câu hỏi được sinh tự động bởi AI dựa trên kỹ năng của <strong>{candidateName}</strong> và yêu cầu vị trí <strong>{jobTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        {!generated ? (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-violet-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Trợ lý Phỏng vấn AI</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                AI sẽ phân tích kỹ năng ứng viên ({candidateSkills.length} kỹ năng) so với yêu cầu job ({jobRequiredSkills.length} kỹ năng) để sinh ra 5 câu hỏi phỏng vấn kỹ thuật phù hợp nhất.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-md mx-auto">
              {candidateSkills.slice(0, 8).map(s => (
                <span key={s} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">{s}</span>
              ))}
              {candidateSkills.length > 8 && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">+{candidateSkills.length - 8}</span>
              )}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-200 px-8 py-6 text-base rounded-xl"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI đang phân tích...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Sinh câu hỏi phỏng vấn</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{questions.length}</span> câu hỏi đã được sinh
              </p>
              <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy tất cả
              </Button>
            </div>

            {questions.map((q, idx) => {
              const cat = CATEGORY_CONFIG[q.category] || CATEGORY_CONFIG.matched_skill;
              const CatIcon = cat.icon;
              return (
                <div key={idx} className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-relaxed mb-2">{q.question}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat.color}`}>
                          <CatIcon className="w-3 h-3" /> {cat.label}
                        </span>
                        {q.skill && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.skill}</span>
                        )}
                        {q.difficulty && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_BADGE[q.difficulty] || ''}`}>
                            {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      onClick={() => handleCopy(q.question, idx)}
                    >
                      {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex gap-2">
              <Button variant="outline" onClick={() => { setGenerated(false); setQuestions([]); }} className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" /> Sinh lại câu hỏi khác
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
