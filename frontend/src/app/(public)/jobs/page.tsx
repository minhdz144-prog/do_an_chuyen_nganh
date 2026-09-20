import { getJobs } from '@/lib/api/jobs';
import JobCard from '@/components/shared/JobCard';
import JobFilters from '@/components/shared/JobFilters';
import Pagination from '@/components/shared/Pagination';
import EmptyState from '@/components/shared/EmptyState';
import JobSearchHero from '@/components/shared/JobSearchHero';

export const revalidate = 0; // Dynamic rendering for search params

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page || '1';
  const { data, pagination } = await getJobs({
    ...resolvedSearchParams,
    page,
    limit: '10', // Changed to 10 to fit 2 columns well
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <JobSearchHero />
      
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 shrink-0">
            <JobFilters />
          </div>

          {/* Job List */}
          <div className="flex-1" id="job-list-container">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Tìm thấy <span className="text-primary">{pagination.total}</span> việc làm phù hợp
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Cập nhật mới nhất hôm nay
                </p>
              </div>
            </div>

            {data.jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
                
                <div className="mt-12">
                  <Pagination 
                    currentPage={pagination.page} 
                    totalPages={pagination.totalPages} 
                  />
                </div>
              </>
            ) : (
              <div className="bg-card border-border rounded-2xl p-8 border">
                <EmptyState 
                  title="Không tìm thấy việc làm phù hợp"
                  description="Vui lòng thử lại với các tiêu chí tìm kiếm khác hoặc bỏ bớt các bộ lọc."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
