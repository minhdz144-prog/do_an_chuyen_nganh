import { Skeleton } from '@/components/ui/skeleton';
import SkeletonJobCard from '@/components/shared/SkeletonJobCard';

export default function CompanyDetailLoading() {
  return (
    <div className="min-h-screen bg-muted/50 pb-12">
      {/* Cover Image Skeleton */}
      <Skeleton className="w-full h-48 md:h-64 lg:h-80 rounded-b-3xl" />
      
      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo Skeleton */}
            <Skeleton className="w-32 h-32 rounded-2xl border-4 border-background shrink-0" />
            
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-8 w-3/4 max-w-sm" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            
            <Skeleton className="w-32 h-10 rounded-full shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="mt-16 border-t border-border pt-12">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonJobCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
