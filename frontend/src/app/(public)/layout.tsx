import Navbar from '@/components/layouts/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer Đơn giản */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm">© {new Date().getFullYear()} IT Job Portal. Thực hiện bởi Sinh viên.</p>
        </div>
      </footer>
    </div>
  );
}
