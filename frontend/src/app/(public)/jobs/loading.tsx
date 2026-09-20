import { Skeleton } from '@/components/ui/skeleton';
import SkeletonJobCard from '@/components/shared/SkeletonJobCard';

export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-muted/50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="mb-10">
          <Skeleton className="h-[120px] w-full rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
