import { getJobs } from '@/lib/api/jobs';
import JobCard from '@/components/shared/JobCard';
import JobFilters from '@/components/shared/JobFilters';
import Pagination from '@/components/shared/Pagination';

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
    limit: '9',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Khám phá việc làm IT
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Tìm kiếm cơ hội nghề nghiệp phù hợp với kỹ năng và định hướng của bạn.
          </p>
        </div>

        <div className="mb-10">
          <JobFilters />
        </div>

        {data.jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
            
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
            />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Không tìm thấy việc làm phù hợp</h3>
            <p className="text-slate-500">Vui lòng thử lại với các tiêu chí tìm kiếm khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
