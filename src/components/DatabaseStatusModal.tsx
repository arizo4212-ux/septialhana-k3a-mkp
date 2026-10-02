import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  X, 
  Layers,
  Sparkles
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { vessels, passengers, cargos, schedules, trackingLogs, notifications, resetDatabaseWithDefaultData, isLoadingData } = useShipData();
  const { user } = useAuth();
  const [resetMessage, setResetMessage] = useState('');

  if (!isOpen) return null;

  const handleReset = async () => {
    setResetMessage('Mengunggah data awal lengkap ke cloud database Firestore...');
    await resetDatabaseWithDefaultData();
    setResetMessage('Data awal berhasil disinkronisasi ke Firebase Firestore!');
    setTimeout(() => setResetMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full text-white shadow-2xl my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Status Real Database (Cloud Firestore)</h3>
              <p className="text-xs text-slate-400">Arsitektur penyimpanan data persisten &amp; real-time synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database specs */}
        <div className="space-y-4 text-xs">
          
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                Firebase Cloud Firestore (Enterprise)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firebase Project ID:</span>
              <span className="font-mono text-emerald-400 font-semibold">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firestore Database ID:</span>
              <span className="font-mono text-slate-300 truncate max-w-[260px]">
                {firebaseConfig.firestoreDatabaseId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status Latensi:</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE (Real-time WebSocket &amp; onSnapshot)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Autentikasi Pengguna:</span>
              <span className="font-semibold text-slate-200">
                {user ? `${user.name} (${user.role})` : 'Anonim / Terautentikasi'}
              </span>
            </div>
          </div>

          {/* Collections Overview */}
          <div>
            <div className="text-slate-400 font-medium mb-2 flex items-center justify-between">
              <span>Koleksi Data Terhubung (Collections):</span>
              <span className="text-emerald-400 font-mono font-semibold">Semua Sinkron</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/vessels</div>
                <div className="text-base font-bold text-white mt-0.5">{vessels.length} Kapal</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/passengers</div>
                <div className="text-base font-bold text-white mt-0.5">{passengers.length} Penumpang</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/cargos</div>
                <div className="text-base font-bold text-white mt-0.5">{cargos.length} Kargo</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/schedules</div>
                <div className="text-base font-bold text-white mt-0.5">{schedules.length} Jadwal</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/tracking_logs</div>
                <div className="text-base font-bold text-white mt-0.5">{trackingLogs.length} Log</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase">/notifications</div>
                <div className="text-base font-bold text-white mt-0.5">{notifications.length} Notifikasi</div>
              </div>
            </div>
          </div>

          {resetMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{resetMessage}</span>
            </div>
          )}

          {/* Reset / Reseed Database Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Muat ulang data armada default jika diperlukan:</span>
            <button
              onClick={handleReset}
              disabled={isLoadingData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-sky-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Sinkronisasi Ulang Default</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
