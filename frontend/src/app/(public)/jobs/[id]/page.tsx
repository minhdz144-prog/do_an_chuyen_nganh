import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, DollarSign, Clock, Building2, Calendar, Eye } from 'lucide-react';
import { getJobById } from '@/lib/api/jobs';
import ApplyButton from '@/components/shared/ApplyButton';
import { Badge } from '@/components/ui/badge';

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
    const job = data.job;

    // JSON-LD for SEO
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.createdAt,
      validThrough: job.deadline,
      employmentType: job.jobType.toUpperCase(),
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
          minValue: job.salary.min,
          maxValue: job.salary.max,
        },
      },
    };

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-slate-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="capitalize">{job.jobType}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mb-8">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-semibold mb-4">Mô tả công việc</h3>
                <div className="whitespace-pre-line text-slate-600 leading-relaxed">
                  {job.description}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden bg-slate-50">
                   {job.company?.logo ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                   ) : (
                     <Building2 className="w-8 h-8 text-slate-400" />
                   )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{job.company?.name || 'Ẩn danh'}</h3>
                  <p className="text-sm text-slate-500">{job.company?.industry}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Quy mô</span>
                  <span className="font-medium text-slate-900">{job.company?.size || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Lượt xem</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" /> {job.views}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Hạn nộp</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> {new Date(job.deadline).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <ApplyButton jobId={job._id} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
