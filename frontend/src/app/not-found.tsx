import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <img src="/images/404-illustration.png" alt="404 Not Found" className="w-full max-w-[400px] mb-8" />
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Không tìm thấy trang</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy kiểm tra lại đường dẫn nhé.
      </p>
      <Link href="/" className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
        Quay lại trang chủ
      </Link>
    </div>
  );
}
