import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Ship, 
  Users, 
  Package, 
  CalendarClock, 
  History, 
  FileText, 
  Database,
  Anchor
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'radar' 
  | 'vessels' 
  | 'passengers' 
  | 'cargos' 
  | 'schedules' 
  | 'tracking' 
  | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDbStatus: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenDbStatus }) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; category?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Analitik', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'radar', label: 'Radar & Live Tracking', icon: <Compass className="w-4 h-4" />, badge: 'LIVE' },
    
    // Master Data Section
    { id: 'vessels', label: 'Master Data Kapal', icon: <Ship className="w-4 h-4" />, category: 'MASTER DATA' },
    
    // Transaksi Data Section
    { id: 'passengers', label: 'Manifest Penumpang', icon: <Users className="w-4 h-4" />, category: 'TRANSAKSI' },
    { id: 'cargos', label: 'Muatan & Kargo', icon: <Package className="w-4 h-4" /> },
    { id: 'schedules', label: 'Jadwal Pelayaran', icon: <CalendarClock className="w-4 h-4" /> },
    
    // Pelacakan & Laporan
    { id: 'tracking', label: 'Histori Pelacakan', icon: <History className="w-4 h-4" />, category: 'LOG & LAPORAN' },
    { id: 'reports', label: 'Laporan & Manifest Resmi', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-1 overflow-y-auto">
        
        {menuItems.map((item, idx) => {
          const isCategoryStart = item.category;
          const isActive = activeTab === item.id;

          return (
            <React.Fragment key={item.id}>
              {isCategoryStart && (
                <div className={`text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 ${idx !== 0 ? 'pt-4 pb-1.5' : 'pb-1'}`}>
                  {item.category}
                </div>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}

      </div>

      {/* Cloud DB & Port Station bottom badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onOpenDbStatus}
          className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Online Cloud Sync
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Firebase Firestore Connected
          </p>
        </button>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5 text-sky-400" />
            KSOP Tanjung Priok
          </span>
          <span>v2.4</span>
        </div>
      </div>
    </aside>
  );
};
