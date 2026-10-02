import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { Schedule, ScheduleStatus } from '../types';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Ship, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { PORT_LIST } from '../lib/seedData';

export const VoyageSchedule: React.FC = () => {
  const { schedules, vessels, addSchedule, updateSchedule, deleteSchedule, activeShipFilter } = useShipData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Kelimutu');
  const [originPort, setOriginPort] = useState(PORT_LIST[0]);
  const [destinationPort, setDestinationPort] = useState(PORT_LIST[1]);
  const [berth, setBerth] = useState('Dermaga 106 Nusantara');
  const [departureTime, setDepartureTime] = useState('2026-10-02 08:00');
  const [arrivalTime, setArrivalTime] = useState('2026-10-03 04:30');
  const [status, setStatus] = useState<ScheduleStatus>('Tepat Waktu');
  const [estimatedPassengers, setEstimatedPassengers] = useState(850);
  const [estimatedCargoTon, setEstimatedCargoTon] = useState(1200);

  const openAdd = () => {
    setVoyageNumber(`VOY/${new Date().getFullYear()}/X/0${Math.floor(40 + Math.random() * 50)}`);
    setVesselName(vessels[0]?.name || 'KM Kelimutu');
    setOriginPort(PORT_LIST[0]);
    setDestinationPort(PORT_LIST[1]);
    setBerth('Dermaga Jamrud Utara');
    setDepartureTime(new Date().toISOString().replace('T', ' ').substring(0, 16));
    setArrivalTime('2026-10-04 12:00');
    setStatus('Tepat Waktu');
    setEstimatedPassengers(750);
    setEstimatedCargoTon(1100);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (s: Schedule) => {
    setEditingId(s.id);
    setVoyageNumber(s.voyageNumber);
    setVesselName(s.vesselName);
    setOriginPort(s.originPort);
    setDestinationPort(s.destinationPort);
    setBerth(s.berth);
    setDepartureTime(s.departureTime);
    setArrivalTime(s.arrivalTime);
    setStatus(s.status);
    setEstimatedPassengers(s.estimatedPassengers);
    setEstimatedCargoTon(s.estimatedCargoTon);
    setIsModalOpen(true);
  };

  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voyageNumber.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateSchedule(editingId, {
          voyageNumber: voyageNumber.trim(),
          vesselName,
          originPort,
          destinationPort,
          berth: berth.trim(),
          departureTime,
          arrivalTime,
          status,
          estimatedPassengers: Number(estimatedPassengers) || 0,
          estimatedCargoTon: Number(estimatedCargoTon) || 0
        });
        setSuccessToast(`Jadwal pelayaran ${voyageNumber} berhasil diperbarui!`);
      } else {
        await addSchedule({
          voyageNumber: voyageNumber.trim(),
          vesselName,
          originPort,
          destinationPort,
          berth: berth.trim(),
          departureTime,
          arrivalTime,
          status,
          estimatedPassengers: Number(estimatedPassengers) || 0,
          estimatedCargoTon: Number(estimatedCargoTon) || 0
        });
        setSuccessToast(`Jadwal pelayaran baru ${voyageNumber} berhasil dibuat!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Error submitting schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    setDeleteConfirmId(null);
  };

  const filtered = schedules.filter(s => {
    const matchShip = activeShipFilter === 'Semua Kapal' || s.vesselName === activeShipFilter;
    const matchSearch = s.voyageNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.vesselName.toLowerCase().includes(search.toLowerCase()) ||
      s.originPort.toLowerCase().includes(search.toLowerCase()) ||
      s.destinationPort.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || s.status === statusFilter;
    return matchShip && matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-sky-400" />
            Jadwal Pelayaran &amp; Alokasi Dermaga Sandar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen nomor pelayaran (Voyage Number), estimasi waktu keberangkatan (ETD), kedatangan (ETA), serta dermaga sandar
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jadwal Pelayaran</span>
        </button>
      </div>

      {/* Filter and Search */}
      {successToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Voyage, Kapal, Pelabuhan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 self-start md:self-auto"
        >
          <option value="Semua">Semua Status Pelayaran</option>
          <option value="Tepat Waktu">Tepat Waktu</option>
          <option value="Boarding">Boarding</option>
          <option value="Berlayar">Berlayar</option>
          <option value="Tiba">Tiba</option>
          <option value="Ditunda">Ditunda</option>
        </select>
      </div>

      {/* Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Voyage</th>
                <th className="py-3 px-4">Armada Kapal</th>
                <th className="py-3 px-4">Rute &amp; Dermaga</th>
                <th className="py-3 px-4">Jadwal ETD / ETA</th>
                <th className="py-3 px-4">Estimasi Beban</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan jadwal pelayaran yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {s.voyageNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-sky-400" />
                        <span>{s.vesselName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{s.originPort} → {s.destinationPort}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Sandar: {s.berth}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-emerald-400">ETD: {s.departureTime}</div>
                      <div className="text-sky-300">ETA: {s.arrivalTime}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-emerald-400 font-medium">{s.estimatedPassengers} Orang</div>
                      <div className="text-amber-400 font-mono text-[11px]">{s.estimatedCargoTon} Ton</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        s.status === 'Berlayar'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : s.status === 'Boarding'
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                          : s.status === 'Tepat Waktu'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                          title="Edit Jadwal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl">
            <h3 className="font-bold text-base text-rose-400 mb-2">Hapus Jadwal Pelayaran?</h3>
            <p className="text-xs text-slate-300 mb-4">
              Jadwal voyage ini akan dihapus dari sistem dan database secara permanen.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-2 bg-rose-600 text-white rounded-xl font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full text-white shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-sky-400" />
                {editingId ? 'Edit Jadwal Pelayaran' : 'Buat Jadwal Pelayaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
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
                  <label className="block text-slate-300 mb-1 font-medium">Armada Kapal *</label>
                  <select
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {vessels.map(v => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pelabuhan Asal</label>
                  <select
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {PORT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pelabuhan Tujuan</label>
                  <select
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {PORT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Dermaga Sandar (Berth Pier)</label>
                  <input
                    type="text"
                    value={berth}
                    onChange={(e) => setBerth(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status Pelayaran *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ScheduleStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Tepat Waktu">Tepat Waktu</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Berlayar">Berlayar</option>
                    <option value="Tiba">Tiba</option>
                    <option value="Ditunda">Ditunda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jadwal Keberangkatan (ETD)</label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jadwal Tiba (ETA)</label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Estimasi Penumpang</label>
                  <input
                    type="number"
                    min={0}
                    value={estimatedPassengers}
                    onChange={(e) => setEstimatedPassengers(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Estimasi Kargo (Ton)</label>
                  <input
                    type="number"
                    min={0}
                    value={estimatedCargoTon}
                    onChange={(e) => setEstimatedCargoTon(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

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
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-600/20 transition cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
