import React from 'react';
import { useShipData } from '../context/ShipDataContext';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Flame, 
  X, 
  Sparkles 
} from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    triggerSimulatedAlert 
  } = useShipData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Flame className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-white">
      {/* Header */}
      <div className="p-3.5 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-sm">Notifikasi Operasional</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => markAllNotificationsAsRead()}
            className="p-1 text-slate-400 hover:text-white rounded transition text-[11px] flex items-center gap-1"
            title="Tandai semua telah dibaca"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Semua</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Tidak ada notifikasi sistem saat ini.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-3.5 transition cursor-pointer hover:bg-slate-750 flex items-start gap-3 ${
                !item.read ? 'bg-sky-950/20' : ''
              }`}
            >
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.timestamp}
                  </span>
                </div>
                <div className={`text-xs font-medium leading-snug mb-1 ${!item.read ? 'text-white' : 'text-slate-300'}`}>
                  {item.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer trigger */}
      <div className="p-2.5 bg-slate-850 border-t border-slate-700/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">Dukungan notifikasi otomatis real-time</span>
        <button
          onClick={() => triggerSimulatedAlert()}
          className="px-2 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
        >
          <Sparkles className="w-3 h-3" />
          Kirim Alert Baru
        </button>
      </div>
    </div>
  );
};
