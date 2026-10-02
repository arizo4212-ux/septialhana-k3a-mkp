import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { Vessel, VesselStatus, VesselType } from '../types';
import { 
  Ship, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Anchor, 
  Gauge, 
  Users, 
  Package 
} from 'lucide-react';
import { PORT_LIST } from '../lib/seedData';

export const VesselMasterData: React.FC = () => {
  const { vessels, addVessel, updateVessel, deleteVessel } = useShipData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<VesselType>('Penumpang & Ro-Ro');
  const [passengerCapacity, setPassengerCapacity] = useState(800);
  const [cargoCapacityTon, setCargoCapacityTon] = useState(1500);
  const [callSign, setCallSign] = useState('PKLM');
  const [captainName, setCaptainName] = useState('Capt. Bambang, M.Mar');
  const [status, setStatus] = useState<VesselStatus>('Bersandar');
  const [currentPort, setCurrentPort] = useState(PORT_LIST[0]);
  const [destinationPort, setDestinationPort] = useState(PORT_LIST[1]);
  const [speedKnots, setSpeedKnots] = useState(15);
  const [lat, setLat] = useState(-6.10);
  const [lng, setLng] = useState(106.88);

  const resetForm = () => {
    setName('');
    setCode('');
    setType('Penumpang & Ro-Ro');
    setPassengerCapacity(800);
    setCargoCapacityTon(1500);
    setCallSign('PKLM');
    setCaptainName('Capt. Bambang, M.Mar');
    setStatus('Bersandar');
    setCurrentPort(PORT_LIST[0]);
    setDestinationPort(PORT_LIST[1]);
    setSpeedKnots(15);
    setLat(-6.10);
    setLng(106.88);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vessel: Vessel) => {
    setEditingId(vessel.id);
    setName(vessel.name);
    setCode(vessel.code);
    setType(vessel.type);
    setPassengerCapacity(vessel.passengerCapacity);
    setCargoCapacityTon(vessel.cargoCapacityTon);
    setCallSign(vessel.callSign);
    setCaptainName(vessel.captainName);
    setStatus(vessel.status);
    setCurrentPort(vessel.currentPort);
    setDestinationPort(vessel.destinationPort);
    setSpeedKnots(vessel.speedKnots);
    setLat(vessel.lat);
    setLng(vessel.lng);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingId) {
      await updateVessel(editingId, {
        name,
        code,
        type,
        passengerCapacity: Number(passengerCapacity),
        cargoCapacityTon: Number(cargoCapacityTon),
        callSign,
        captainName,
        status,
        currentPort,
        destinationPort,
        speedKnots: Number(speedKnots),
        lat: Number(lat),
        lng: Number(lng)
      });
    } else {
      await addVessel({
        name,
        code,
        type,
        passengerCapacity: Number(passengerCapacity),
        cargoCapacityTon: Number(cargoCapacityTon),
        callSign,
        captainName,
        status,
        currentPort,
        destinationPort,
        speedKnots: Number(speedKnots),
        lat: Number(lat),
        lng: Number(lng)
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteVessel(id);
    setDeleteConfirmId(null);
  };

  // Filtered vessels
  const filtered = vessels.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.captainName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || v.status === statusFilter;
    const matchType = typeFilter === 'Semua' || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ship className="w-5 h-5 text-sky-400" />
            Master Data Armada Kapal Laut
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen spesifikasi teknis kapal, kapasitas palka kargo, penumpang, dan status berlayar
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Armada Kapal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama kapal, kode, nahkoda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Berlayar">Berlayar</option>
            <option value="Bersandar">Bersandar</option>
            <option value="Proses Muat">Proses Muat</option>
            <option value="Perbaikan">Perbaikan</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="Semua">Semua Jenis Kapal</option>
            <option value="Penumpang & Ro-Ro">Penumpang &amp; Ro-Ro</option>
            <option value="Petikemas / Kontainer">Petikemas / Kontainer</option>
            <option value="Kapal Cepat / Ferry">Kapal Cepat / Ferry</option>
            <option value="Kargo Curah / General Cargo">Kargo Curah</option>
          </select>
        </div>
      </div>

      {/* Vessels Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Kapal &amp; Kode</th>
                <th className="py-3 px-4">Jenis Kapal</th>
                <th className="py-3 px-4">Kapasitas</th>
                <th className="py-3 px-4">Posisi &amp; Rute</th>
                <th className="py-3 px-4">Kecepatan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data armada kapal.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{v.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Kode: {v.code} • Call Sign: {v.callSign}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Nahkoda: {v.captainName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {v.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{v.passengerCapacity} Penumpang</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 mt-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>{v.cargoCapacityTon} Ton Kargo</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{v.currentPort}</div>
                      <div className="text-[11px] text-sky-400">→ {v.destinationPort}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                      {v.speedKnots > 0 ? `${v.speedKnots} Knot` : '0 Knot'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        v.status === 'Berlayar'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : v.status === 'Proses Muat'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                          title="Edit Kapal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(v.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Hapus Kapal"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base">Hapus Data Kapal?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Tindakan ini akan menghapus data kapal dari database online Firestore secara permanen.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full text-white shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Ship className="w-5 h-5 text-sky-400" />
                {editingId ? 'Edit Data Armada Kapal' : 'Tambah Armada Kapal Baru'}
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
                  <label className="block text-slate-300 mb-1 font-medium">Nama Kapal *</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: KM Labobar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kode Kapal *</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: LBR-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jenis Kapal *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VesselType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Penumpang & Ro-Ro">Penumpang &amp; Ro-Ro</option>
                    <option value="Petikemas / Kontainer">Petikemas / Kontainer</option>
                    <option value="Kapal Cepat / Ferry">Kapal Cepat / Ferry</option>
                    <option value="Kargo Curah / General Cargo">Kargo Curah / General Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Call Sign Radio</label>
                  <input
                    type="text"
                    placeholder="contoh: PLBR"
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kapasitas Penumpang (Orang)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={passengerCapacity}
                    onChange={(e) => setPassengerCapacity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kapasitas Palka Kargo (Ton)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={cargoCapacityTon}
                    onChange={(e) => setCargoCapacityTon(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nahkoda / Master</label>
                  <input
                    type="text"
                    placeholder="Capt. Nama Nahkoda"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status Operasional *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Berlayar">Berlayar</option>
                    <option value="Bersandar">Bersandar</option>
                    <option value="Proses Muat">Proses Muat</option>
                    <option value="Perbaikan">Perbaikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pelabuhan Asal</label>
                  <select
                    value={currentPort}
                    onChange={(e) => setCurrentPort(e.target.value)}
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
                  <label className="block text-slate-300 mb-1 font-medium">Kecepatan Saat Ini (Knot)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Lintang (Lat)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Bujur (Lng)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-600/20 transition cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Kapal'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
