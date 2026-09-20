'use client';
import { Eye, Users, UserPlus, Bookmark, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminDashboardPage() {
  const statCards = [
    { label: 'Profile Views', value: '112.000', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Followers', value: '183.000', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Following', value: '80.000', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Saved Post', value: '112', icon: Bookmark, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const chartData = [
    { name: 'Jan', europe: 4000, america: 2400, indonesia: 2400 },
    { name: 'Feb', europe: 3000, america: 1398, indonesia: 2210 },
    { name: 'Mar', europe: 2000, america: 9800, indonesia: 2290 },
    { name: 'Apr', europe: 2780, america: 3908, indonesia: 2000 },
    { name: 'May', europe: 1890, america: 4800, indonesia: 2181 },
    { name: 'Jun', europe: 2390, america: 3800, indonesia: 2500 },
    { name: 'Jul', europe: 3490, america: 4300, indonesia: 2100 },
  ];

  const recentUsers = [
    { name: 'John Doe', role: 'Software Engineer', avatar: 'https://i.pravatar.cc/150?u=1' },
    { name: 'Jane Smith', role: 'Data Scientist', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Robert Johnson', role: 'Product Manager', avatar: 'https://i.pravatar.cc/150?u=3' },
    { name: 'Emily Davis', role: 'UX Designer', avatar: 'https://i.pravatar.cc/150?u=4' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-transform hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</h4>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Profile Visit</h4>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEurope" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#435ebe" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#435ebe" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAmerica" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5ddab4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#5ddab4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="europe" stroke="#435ebe" strokeWidth={3} fillOpacity={1} fill="url(#colorEurope)" name="Europe" />
                  <Area type="monotone" dataKey="america" stroke="#5ddab4" strokeWidth={3} fillOpacity={1} fill="url(#colorAmerica)" name="America" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Summary */}
          <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-14 h-14 rounded-full" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">John Ducky</h4>
                <p className="text-sm text-slate-500">@johnducky</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Sales</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">4,624</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Revenue</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">$ 43,123</span>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Users</h4>
            <div className="space-y-5">
              {recentUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</h5>
                    <p className="text-xs text-slate-500 truncate">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-[#435ebe]/10 text-[#435ebe] font-bold rounded-xl hover:bg-[#435ebe]/20 transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
