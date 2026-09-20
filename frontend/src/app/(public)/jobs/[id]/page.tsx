import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, DollarSign, Clock, Building2, Calendar, Eye, Users } from 'lucide-react';
import { getJobById } from '@/lib/api/jobs';
import ApplyButton from '@/components/shared/ApplyButton';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/shared/JobCard';
import { formatDeadline } from '@/lib/utils';
import CompanyLogoMark from '@/components/shared/CompanyLogoMark';
import MatchingScoreIndicator from '@/components/shared/MatchingScoreIndicator';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { data } = await getJobById(resolvedParams.id);
    const job = data.job;

    return {
      title: `${job.title} tại ${job.company?.name || 'Công ty ẩn danh'} | IT Job Portal`,
      description: job.description.substring(0, 160),
    };
  } catch (error) {
    return {
      title: 'Không tìm thấy việc làm',
    };
  }
}

export default async function JobDetailPage({ params }: Props) {
  try {
    const resolvedParams = await params;
    const { data } = await getJobById(resolvedParams.id);
    const { job, relatedJobs } = data;

    // JSON-LD for SEO
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.createdAt,
      validThrough: job.deadline || new Date().toISOString(),
      employmentType: (job.jobType || (job as any).type || 'FULL-TIME').toUpperCase(),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company?.name || 'Công ty ẩn danh',
        sameAs: job.company?.website,
        logo: job.company?.logo,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'VN',
        },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary?.min || 0,
          maxValue: job.salary?.max || 0,
        },
      },
    };

    return (
      <div className="min-h-screen bg-muted/50 py-12 px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h1 className="text-3xl font-bold text-foreground mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground dark:text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-muted-foreground/80 dark:text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-5 h-5 text-primary/90" />
                  <span className="font-semibold text-primary">
                    ${(job.salary?.min || 0).toLocaleString()} - ${(job.salary?.max || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-muted-foreground/80 dark:text-muted-foreground" />
                  <span className="capitalize">{job.jobType || (job as any).type || 'Thỏa thuận'}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mb-8">
                {(job.requiredSkills || (job as any).skills || []).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-muted text-foreground/80 font-mono">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold mb-4">Mô tả công việc</h3>
                <div className="whitespace-pre-line text-muted-foreground dark:text-muted-foreground leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm sticky top-24">
              {/* Company Avatar + Info — bọc trong Link dẫn tới Company Profile */}
              <Link href={`/companies/${job.company?._id}`} className="flex items-center gap-4 mb-6 group hover:opacity-80 transition-opacity" title={`Xem trang tuyển dụng của ${job.company?.name}`}>
                <CompanyLogoMark 
                  name={job.company?.name || 'Ẩn danh'} 
                  industry={job.company?.industry} 
                  logoUrl={job.company?.logo}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{job.company?.name || 'Ẩn danh'}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{job.company?.industry}</p>
                </div>
              </Link>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground dark:text-muted-foreground">Quy mô</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground/80 dark:text-muted-foreground" />
                    {job.company?.size || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground dark:text-muted-foreground">Lượt xem</span>
                  <span className="font-medium text-foreground flex items-center gap-1 font-mono">
                    <Eye className="w-4 h-4 text-muted-foreground/80 dark:text-muted-foreground" /> {job.views}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground dark:text-muted-foreground">Hạn nộp</span>
                  <span className="font-medium text-foreground flex items-center gap-1 font-mono">
                    <Calendar className="w-4 h-4 text-muted-foreground/80 dark:text-muted-foreground" /> {formatDeadline(job.deadline)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <MatchingScoreIndicator jobSkills={job.requiredSkills || (job as any).skills || []} />
              </div>

              <ApplyButton job={job} />
            </div>
          </div>
        </div>

        {/* Việc làm liên quan */}
        {relatedJobs && relatedJobs.length > 0 && (
          <div className="mt-16 border-t border-border pt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold font-display text-foreground mb-8">Việc làm liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relatedJob: any) => (
                <JobCard key={relatedJob._id} job={relatedJob} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
