import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShipData } from '../context/ShipDataContext';
import { 
  Ship, 
  Database, 
  Bell, 
  LogOut, 
  RefreshCw, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onOpenDbStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDbStatus }) => {
  const { user, logout } = useAuth();
  const { 
    vessels, 
    activeShipFilter, 
    setActiveShipFilter, 
    notifications, 
    triggerSimulatedAlert,
    dbConnected 
  } = useShipData();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand & Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600 rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">LogiShip</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">Sistem Muatan &amp; Manifest Penumpang Kapal Laut</p>
            </div>
          </div>

          {/* Ship Filter */}
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800">
            <span className="text-xs text-slate-400">Filter Kapal:</span>
            <select
              value={activeShipFilter}
              onChange={(e) => setActiveShipFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="Semua Kapal">Semua Kapal ({vessels.length} Armada)</option>
              {vessels.map(v => (
                <option key={v.id} value={v.name}>{v.name} ({v.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Database Pill, Notif, User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Real Database Status Indicator */}
          <button
            onClick={onOpenDbStatus}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition cursor-pointer"
            title="Klik untuk melihat status koneksi Cloud Database"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Firebase DB:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {dbConnected ? 'ONLINE' : 'CONNECTING'}
            </span>
          </button>

          {/* Trigger Test Notification */}
          <button
            onClick={triggerSimulatedAlert}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900 border border-sky-800/50 rounded-lg text-xs text-sky-300 transition"
            title="Kirim notifikasi otomatis simulasi (cuaca/muatan)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Tes Alert</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition cursor-pointer"
              title="Pusat Notifikasi Otomatis"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <NotificationCenter onClose={() => setShowNotifDropdown(false)} />
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-left transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-500/40 text-sky-300 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-sky-400 leading-tight">
                  {user?.role || 'Super Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2.5 border-b border-slate-700">
                  <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {user?.role}
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Penempatan: <span className="text-slate-200">{user?.port}</span>
                </div>

                <div className="border-t border-slate-700 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Aplikasi</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
