import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AIAssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  } | null;
  candidateName: string;
}

export default function AIAssessmentDialog({ isOpen, onClose, assessment, candidateName }: AIAssessmentDialogProps) {
  if (!assessment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Phân Tích Ứng Viên
          </DialogTitle>
          <DialogDescription>
            Đánh giá tự động cho hồ sơ của {candidateName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Điểm mạnh phù hợp
            </h4>
            <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 ml-1">
              {assessment.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-rose-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Điểm cần cân nhắc
            </h4>
            <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 ml-1">
              {assessment.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-500 flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" /> Đánh giá chung
            </h4>
            <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
              {assessment.recommendation}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
