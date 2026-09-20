import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, TrendingUp, Lightbulb, Compass } from 'lucide-react';

interface AICareerPathDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pathData: {
    nextSkills: string[];
    careerAdvice: string;
  } | null;
}

export default function AICareerPathDialog({ isOpen, onClose, pathData }: AICareerPathDialogProps) {
  if (!pathData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Gợi Ý Định Hướng Nghề Nghiệp
          </DialogTitle>
          <DialogDescription>
            Phân tích dựa trên kỹ năng hiện tại của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-indigo-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Kỹ năng khuyên học tiếp theo
            </h4>
            <div className="flex flex-wrap gap-2">
              {pathData.nextSkills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                  <Lightbulb className="w-3.5 h-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-slate-500" /> Định hướng tổng quan
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pathData.careerAdvice}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
