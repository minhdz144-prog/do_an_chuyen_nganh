import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-black"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2500&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center text-3xl font-bold text-white tracking-tight drop-shadow-md hover:scale-105 transition-transform">
            <img src="/images/logo.svg" alt="IT Job Portal" className="w-10 h-10 drop-shadow-md" />
            <span>IT Job<span className="text-emerald-400">Portal</span></span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
