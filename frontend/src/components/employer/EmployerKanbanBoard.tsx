'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Application } from '@/types/application';
import { Mail, Phone, ExternalLink, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AIInterviewDialog from './AIInterviewDialog';

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (appId: string, newStatus: string) => Promise<void>;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  validTransitions: Record<string, string[]>;
}

// Columns definition in order
const COLUMNS = ['applied', 'reviewing', 'interview', 'offered', 'rejected'];

export default function EmployerKanbanBoard({
  applications,
  onStatusChange,
  statusLabels,
  statusColors,
  validTransitions
}: KanbanBoardProps) {
  // Local state for optimistic UI updates during drag
  const [boardData, setBoardData] = useState<Record<string, Application[]>>({
    applied: [], reviewing: [], interview: [], offered: [], rejected: []
  });
  const [isClient, setIsClient] = useState(false);

  // ★ AI Interview Dialog state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDialogData, setAiDialogData] = useState<{
    candidateSkills: string[];
    jobRequiredSkills: string[];
    jobTitle: string;
    candidateName: string;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Group applications by status
    const newBoard = { applied: [], reviewing: [], interview: [], offered: [], rejected: [] } as Record<string, Application[]>;
    applications.forEach(app => {
      if (newBoard[app.status]) {
        newBoard[app.status].push(app);
      }
    });
    setBoardData(newBoard);
  }, [applications]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Check validity based on business logic transitions
    if (sourceStatus !== destStatus) {
      const allowedNext = validTransitions[sourceStatus] || [];
      if (!allowedNext.includes(destStatus)) {
        // Not allowed, UI will snap back automatically
        return;
      }
    }

    // Optimistic Update
    const sourceClone = Array.from(boardData[sourceStatus]);
    const destClone = Array.from(boardData[destStatus]);
    const [movedApp] = sourceClone.splice(source.index, 1);

    if (sourceStatus === destStatus) {
      sourceClone.splice(destination.index, 0, movedApp);
      setBoardData({ ...boardData, [sourceStatus]: sourceClone });
    } else {
      movedApp.status = destStatus as any;
      destClone.splice(destination.index, 0, movedApp);
      setBoardData({ ...boardData, [sourceStatus]: sourceClone, [destStatus]: destClone });
      
      // Fire API Call
      await onStatusChange(draggableId, destStatus);
    }
  };

  const handleOpenAIDialog = (app: Application) => {
    setAiDialogData({
      candidateSkills: app.candidate?.candidateProfile?.skills || [],
      jobRequiredSkills: (app.job as any)?.requiredSkills || [],
      jobTitle: (app.job as any)?.title || 'N/A',
      candidateName: app.candidate?.name || 'Ứng viên',
    });
    setAiDialogOpen(true);
  };

  if (!isClient) return null; // Avoid hydration mismatch for dnd

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[600px] items-start">
          {COLUMNS.map((columnId) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-80 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-inherit z-10 rounded-t-2xl">
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      {statusLabels[columnId]}
                    </h3>
                    <span className="bg-white dark:bg-slate-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                      {boardData[columnId]?.length || 0}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {boardData[columnId]?.map((app, index) => (
                      <Draggable key={app._id} draggableId={app._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-slate-950 p-4 rounded-xl border shadow-sm transition-all select-none
                              ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary border-transparent rotate-2' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'}
                            `}
                            style={provided.draggableProps.style}
                          >
                            <div className="mb-2">
                              <h4 className="font-bold text-sm text-foreground truncate">{app.candidate?.name}</h4>
                              <div className="text-xs text-muted-foreground truncate mt-0.5">{(app.job as any).title}</div>
                            </div>
                            
                            <div className="space-y-1.5 mb-3">
                              {app.candidate?.email && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{app.candidate.email}</span>
                                </div>
                              )}
                              {app.candidate?.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span>{app.candidate.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {format(new Date(app.createdAt), 'dd/MM/yyyy')}
                              </span>
                              
                              <div className="flex items-center gap-1.5">
                                {/* ★ AI Button — chỉ hiện ở cột Interview */}
                                {columnId === 'interview' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenAIDialog(app); }}
                                    className="inline-flex items-center justify-center rounded-md text-[10px] font-medium transition-all h-6 px-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-sm shadow-violet-200 gap-1"
                                    title="AI Gợi ý câu hỏi phỏng vấn"
                                  >
                                    <Sparkles className="w-3 h-3" /> AI
                                  </button>
                                )}
                                {app.resumeUrl && (
                                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-primary/10 h-6 px-2 text-[10px] bg-primary/5 text-primary">
                                    Xem CV <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* ★ AI Interview Dialog */}
      {aiDialogData && (
        <AIInterviewDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          candidateSkills={aiDialogData.candidateSkills}
          jobRequiredSkills={aiDialogData.jobRequiredSkills}
          jobTitle={aiDialogData.jobTitle}
          candidateName={aiDialogData.candidateName}
        />
      )}
    </>
  );
}
