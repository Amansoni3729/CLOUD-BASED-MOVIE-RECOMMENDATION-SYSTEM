import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, History, User, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Personalized', path: '/personalized', icon: Sparkles },
    { name: 'Search History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 glass-panel border-r shrink-0 hidden lg:flex flex-col p-6 space-y-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-2">Discovery</div>
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 text-sm p-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-white/5 text-brand font-semibold shadow-inner" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{item.name}</span>
              {({ isActive }) => isActive && (
                <div className="ml-auto w-1 h-4 bg-brand rounded-full animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-2">Recent Activity</div>
        <div className="space-y-4">
          {/* Simulated recent items from history would go here */}
          <div className="flex items-center space-x-3 group cursor-pointer bg-white/5 p-2 rounded-lg border border-transparent hover:border-white/5 transition-all">
            <div className="w-10 h-14 bg-gray-800 rounded shadow-md shrink-0 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
               <img src="https://images.unsplash.com/photo-1542204127-04664426aa05?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover opacity-50" />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-gray-300 group-hover:text-brand transition-colors">Inception</p>
              <p className="text-[10px] text-gray-500">Just now</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 group cursor-pointer p-2 opacity-60 hover:opacity-100 transition-all">
            <div className="w-10 h-14 bg-gray-800 rounded shrink-0 flex items-center justify-center text-gray-600 font-bold">BK</div>
            <div className="overflow-hidden text-xs">
              <p className="truncate text-gray-300">The Dark Knight</p>
              <p className="text-[10px] text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
         <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-brand/10 transition-all" />
            <div className="relative z-10 flex flex-col gap-2">
               <p className="text-[10px] font-bold text-brand uppercase tracking-wider">Premium Access</p>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">Upgrade to get 4K suggestions & offline history.</p>
               <button className="text-[10px] font-black uppercase text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                  LEARN MORE <ExternalLink className="w-3 h-3" />
               </button>
            </div>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
