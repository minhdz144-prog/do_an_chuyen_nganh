'use client';

import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title = "Không có dữ liệu", 
  description = "Không tìm thấy dữ liệu nào phù hợp với yêu cầu của bạn.", 
  icon = <FileSearch className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border text-center shadow-sm"
    >
      {icon}
      <h3 className="text-xl font-semibold text-foreground/80 mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </motion.div>
  );
}
