import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141517] border-t border-white/5 pt-16 pb-8 text-slate-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Cột 1: Thông tin công ty & Logo */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <img src="/images/logo.svg" alt="IT Job" className="w-9 h-9 drop-shadow-lg" />
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-white">IT</span>
                <span className="text-emerald-400">Job</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              IT Job Portal tự hào là nền tảng tuyển dụng IT tích hợp công nghệ AI số 1, kết nối hàng ngàn ứng viên tài năng với các doanh nghiệp công nghệ hàng đầu khu vực.
            </p>
            
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">TP. Hồ Chí Minh, Việt Nam</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">0933976366</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">minhdz144@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi & Chính sách */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Về IT Job Portal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Giới thiệu', href: '/about' },
                { label: 'Liên hệ', href: '/contact' },
                { label: 'Góc báo chí', href: '/press' },
                { label: 'Chính sách bảo mật (Privacy Policy)', href: '/privacy', highlight: true },
                { label: 'Điều khoản dịch vụ', href: '/terms' },
                { label: 'Quy chế hoạt động', href: '/regulation' },
                { label: 'Cơ chế giải quyết khiếu nại', href: '/complaint' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="group flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-400" />
                    <span className={item.highlight ? 'text-slate-300 font-medium' : ''}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Ứng viên */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Dành cho Ứng viên</h3>
            <ul className="space-y-3">
              {[
                { label: 'Việc làm IT mới nhất', href: '/jobs' },
                { label: 'Việc làm Senior / Quản lý', href: '/jobs?level=senior' },
                { label: 'Tạo CV Online (AI Suggest)', href: '/candidate/cv' },
                { label: 'Cẩm nang phỏng vấn', href: '/blog/interview' },
                { label: 'Công cụ tính lương Gross/Net', href: '/tools/salary' },
                { label: 'Trắc nghiệm tính cách MBTI', href: '/tools/mbti' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="group flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Nhà tuyển dụng & Mạng xã hội */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Nhà Tuyển Dụng</h3>
            <ul className="space-y-3 mb-8">
              {[
                { label: 'Đăng tuyển dụng miễn phí', href: '/employer/register' },
                { label: 'Tìm kiếm Hồ sơ ứng viên (AI)', href: '/employer/search' },
                { label: 'Sản phẩm & Báo giá', href: '/pricing' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="group flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-bold mb-4 text-lg">Kết nối với chúng tôi</h3>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/Minhdzzz2k5/?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] text-slate-400 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] text-slate-400 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://github.com/minhdz144-prog/do_an_chuyen_nganh" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#333] hover:border-[#333] text-slate-400 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
            
            {/* Tải App Box */}
            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Tải ứng dụng ngay</p>
              <div className="flex gap-2">
                <div className="h-10 px-3 bg-white/10 rounded-lg flex items-center justify-center flex-1 hover:bg-white/20 transition-colors cursor-pointer border border-white/5">
                  <span className="text-xs font-bold text-white">App Store</span>
                </div>
                <div className="h-10 px-3 bg-white/10 rounded-lg flex items-center justify-center flex-1 hover:bg-white/20 transition-colors cursor-pointer border border-white/5">
                  <span className="text-xs font-bold text-white">Google Play</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Chứng nhận */}
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Giả lập logo Bộ Công Thương & DMCA */}
            <div className="h-12 px-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              Đã thông báo <br/> Bộ Công Thương
            </div>
            <div className="h-12 px-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
              DMCA <br/> Protected
            </div>
          </div>
          <div className="text-center md:text-right text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-400">© {currentYear} IT Job Portal. Đồ án chuyên ngành.</p>
            <p>Khoa Công nghệ thông tin — Trường Đại học Nguyễn Tất Thành</p>
            <p>Phát triển và vận hành bởi: <span className="font-bold text-slate-300">Giang Văn Minh</span></p>
            <p>Liên hệ hợp tác: minhdz144@gmail.com — Hotline: 0933.976.366</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
