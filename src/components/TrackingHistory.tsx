import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { TrackingLog, EventType } from '../types';
import { 
  History, 
  Plus, 
  Search, 
  Trash2, 
  Ship, 
  MapPin, 
  UserCheck, 
  Clock, 
  FileCheck2, 
  Wind, 
  Anchor, 
  X,
  Container
} from 'lucide-react';

export const TrackingHistory: React.FC = () => {
  const { trackingLogs, vessels, addTrackingLog, deleteTrackingLog, activeShipFilter } = useShipData();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Kelimutu');
  const [voyageNumber, setVoyageNumber] = useState('VOY/2026/X/041');
  const [eventType, setEventType] = useState<EventType>('Keberangkatan');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Dermaga 106 Tanjung Priok');
  const [officer, setOfficer] = useState('Petugas Jaga Pelabuhan');

  const openAdd = () => {
    setVesselName(vessels[0]?.name || 'KM Kelimutu');
    setVoyageNumber('VOY/2026/X/041');
    setEventType('Keberangkatan');
    setDescription('');
    setLocation('Dermaga Sandar Pelabuhan');
    setOfficer('Petugas Pengawas KSOP');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await addTrackingLog({
      vesselName,
      voyageNumber,
      eventType,
      description,
      location,
      officer,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setIsModalOpen(false);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'Keberangkatan': return <Ship className="w-4 h-4 text-emerald-400" />;
      case 'Kedatangan': return <Anchor className="w-4 h-4 text-sky-400" />;
      case 'Izin Syahbandar (SPB)': return <FileCheck2 className="w-4 h-4 text-indigo-400" />;
      case 'Loading Crane': return <Container className="w-4 h-4 text-amber-400" />;
      case 'Cuaca Laut': return <Wind className="w-4 h-4 text-rose-400" />;
      default: return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const filtered = trackingLogs.filter(l => {
    const matchShip = activeShipFilter === 'Semua Kapal' || l.vesselName === activeShipFilter;
    const matchSearch = l.vesselName.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.officer.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'Semua' || l.eventType === eventFilter;
    return matchShip && matchSearch && matchEvent;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Histori Pelacakan &amp; Log Peristiwa Pelayaran
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail lengkap aktivitas operasional pelayaran: keberangkatan, muat crane, izin SPB Syahbandar, cuaca laut, dan docking
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Log Aktivitas Baru</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari deskripsi, lokasi, petugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 self-start md:self-auto"
        >
          <option value="Semua">Semua Jenis Peristiwa</option>
          <option value="Keberangkatan">Keberangkatan</option>
          <option value="Kedatangan">Kedatangan</option>
          <option value="Izin Syahbandar (SPB)">Izin Syahbandar (SPB)</option>
          <option value="Loading Crane">Loading Crane</option>
          <option value="Check-in Penumpang">Check-in Penumpang</option>
          <option value="Cuaca Laut">Cuaca Laut</option>
          <option value="Inspeksi Palka">Inspeksi Palka</option>
        </select>
      </div>

      {/* Timeline View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada catatan histori pelacakan yang ditemukan.
            </div>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                
                {/* Timeline Node Dot */}
                <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-lg group-hover:border-sky-500 transition">
                  {getEventIcon(log.eventType)}
                </div>

                {/* Content Box */}
                <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.vesselName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({log.voyageNumber})</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/80 text-sky-300 font-medium text-[10px]">
                        {log.eventType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                      <button
                        onClick={() => deleteTrackingLog(log.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">
                    {log.description}
                  </p>

                  <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {log.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Petugas: <span className="text-slate-200">{log.officer}</span>
                    </span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full text-white shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Catat Log Aktivitas Pelayaran
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Armada Kapal *</label>
                <select
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {vessels.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nomor Pelayaran (Voyage) *</label>
                <input
                  type="text"
                  required
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Jenis Peristiwa *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Keberangkatan">Keberangkatan</option>
                  <option value="Kedatangan">Kedatangan</option>
                  <option value="Izin Syahbandar (SPB)">Izin Syahbandar (SPB)</option>
                  <option value="Loading Crane">Loading Crane</option>
                  <option value="Check-in Penumpang">Check-in Penumpang</option>
                  <option value="Cuaca Laut">Cuaca Laut</option>
                  <option value="Inspeksi Palka">Inspeksi Palka</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Deskripsi Peristiwa *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Catatan rinci kondisi kapal, muatan, cuaca, atau perizinan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Lokasi / Dermaga Sandar</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Petugas Pencatat (Officer)</label>
                <input
                  type="text"
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  Simpan Catatan Log
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
