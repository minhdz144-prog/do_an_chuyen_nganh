import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Globe, Users, Briefcase, CalendarDays, Link as LinkIcon, Building2, Code2, Gift, Check } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import JobCard from '@/components/shared/JobCard';
import CompanyLogoMark from '@/components/shared/CompanyLogoMark';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

async function getCompanyData(id: string) {
  try {
    const [companyRes, jobsRes] = await Promise.all([
      axiosInstance.get(`/companies/${id}`),
      axiosInstance.get(`/jobs?company=${id}&status=active&limit=100`)
    ]);
    return {
      company: companyRes.data.company,
      jobs: jobsRes.data.jobs
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getCompanyData(resolvedParams.id);
  
  if (!data?.company) return { title: 'Không tìm thấy công ty' };

  return {
    title: `${data.company.name} | Tuyển dụng & Việc làm`,
    description: data.company.description?.substring(0, 160) || `Xem các cơ hội việc làm hấp dẫn tại ${data.company.name}`,
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const data = await getCompanyData(resolvedParams.id);

  if (!data?.company) {
    notFound();
  }

  const { company, jobs } = data;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* ★ Company Header — full-width hero strip */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <CompanyLogoMark 
              name={company.name} 
              industry={company.industry} 
              logoUrl={company.logo}
              size="xl"
              className="border-4 border-border shadow-md"
            />

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">{company.name}</h1>
                <p className="text-lg text-muted-foreground mt-1">{company.industry}</p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
                {company.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.employeeCount ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{company.employeeCount} nhân viên</span>
                  </div>
                ) : company.size && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{company.size} nhân viên</span>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>Thành lập {company.foundedYear}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>

              {/* ★ Quick stats row */}
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{jobs.length} việc làm đang mở</span>
                </div>
                {company.createdAt && (
                  <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Tham gia {new Date(company.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ★ Main Content — layout xếp dọc, không 2 cột */}
      <div className="max-w-5xl mx-auto px-6 mt-10 space-y-10">
        {/* Section: Giới thiệu — full-width */}
        <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-5 font-display">Giới thiệu công ty</h2>
          {company.description ? (
            <div className="prose prose-slate max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
              {company.description}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Chưa có thông tin giới thiệu.</p>
          )}
        </section>

        {/* Section: Tech Stack */}
        {company.techStack && company.techStack.length > 0 && (
          <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-5 font-display flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              Công nghệ sử dụng
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.techStack.map((tech: string) => (
                <span key={tech} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Section: Phúc lợi */}
        {company.benefits && company.benefits.length > 0 && (
          <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-5 font-display flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Phúc lợi dành cho bạn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.benefits.map((benefit: string) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-foreground/90">{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Việc làm đang tuyển — full-width với JobCard grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display">
              Việc làm đang tuyển
              {jobs.length > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground font-mono">({jobs.length})</span>
              )}
            </h2>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-12 border border-border text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Hiện tại công ty không có việc làm nào đang mở.</p>
              <Link href="/jobs" className="text-primary hover:underline text-sm mt-2 inline-block">
                Khám phá tất cả việc làm &rarr;
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
