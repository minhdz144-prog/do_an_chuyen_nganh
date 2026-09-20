'use client';
import { Menu, Search, Bell, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MazerHeaderProps {
  toggleSidebar: () => void;
}

export default function MazerHeader({ toggleSidebar }: MazerHeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-[90px] px-8 flex items-center justify-between bg-transparent">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500">
          <button className="relative p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Mail className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <button className="relative p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#435ebe] transition-colors">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-500 font-medium">Admin</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#435ebe]/10 text-[#435ebe] font-bold">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem className="cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem 
                className="cursor-pointer font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 focus:text-rose-500 focus:bg-rose-50"
                onClick={() => logout()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
