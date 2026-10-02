import React from 'react';
import { ActiveTab } from './Sidebar';
import { 
  LayoutDashboard, 
  Compass, 
  Ship, 
  Users, 
  Package, 
  FileText 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'radar', label: 'Radar', icon: <Compass className="w-4 h-4" /> },
    { id: 'vessels', label: 'Kapal', icon: <Ship className="w-4 h-4" /> },
    { id: 'passengers', label: 'Penumpang', icon: <Users className="w-4 h-4" /> },
    { id: 'cargos', label: 'Muatan', icon: <Package className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((it) => {
        const isActive = activeTab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setActiveTab(it.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};
