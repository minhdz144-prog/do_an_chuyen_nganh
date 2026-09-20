import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonJobCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center w-full">
          {/* Company Logo Skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            {/* Title Skeleton */}
            <Skeleton className="h-5 w-3/4 max-w-[200px]" />
            {/* Company Name Skeleton */}
            <Skeleton className="h-4 w-1/2 max-w-[150px]" />
          </div>
        </div>
        {/* Bookmark Skeleton */}
        <Skeleton className="w-8 h-8 rounded-full shrink-0 ml-2" />
      </div>

      {/* Meta info (Location, Salary, Type) */}
      <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
