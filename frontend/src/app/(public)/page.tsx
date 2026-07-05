import Link from 'next/link';
import { getJobs } from '@/lib/api/jobs';
import JobCard from '@/components/shared/JobCard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const revalidate = 60; // ISR cache 60s cho trang chủ

export default async function HomePage() {
  const { data } = await getJobs({ limit: '6' });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Kết nối nhân tài IT với <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Công việc trong mơ
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Hàng ngàn cơ hội việc làm Developer, Designer, Product Manager đang chờ bạn khám phá.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/jobs" className={cn(buttonVariants({ size: "lg" }), "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8")}>
              Tìm việc ngay
            </Link>
            <Link href="/employer" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-8 bg-transparent text-white border-slate-700 hover:bg-slate-800")}>
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Việc làm mới nhất</h2>
            <p className="text-slate-500">Cập nhật những cơ hội nghề nghiệp hot nhất hôm nay</p>
          </div>
          <Link href="/jobs" className={cn(buttonVariants({ variant: "ghost" }), "text-slate-600 hover:text-slate-900 hidden md:inline-flex")}>
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <Link href="/jobs" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            Xem tất cả
          </Link>
        </div>
      </section>
    </div>
  );
}
