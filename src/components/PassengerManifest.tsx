import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { Passenger, CabinClass, PassengerGender, PassengerStatus } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  X, 
  Ticket, 
  Ship, 
  QrCode, 
  Download 
} from 'lucide-react';
import { PORT_LIST } from '../lib/seedData';

interface PassengerManifestProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const PassengerManifest: React.FC<PassengerManifestProps> = ({ 
  isAddModalOpen: propAddOpen, 
  onCloseAddModal 
}) => {
  const { passengers, vessels, addPassenger, updatePassenger, deletePassenger, activeShipFilter } = useShipData();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [classFilter, setClassFilter] = useState('Semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewTicket, setViewTicket] = useState<Passenger | null>(null);

  // Form Fields
  const [ticketNumber, setTicketNumber] = useState('');
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<PassengerGender>('Laki-laki');
  const [age, setAge] = useState(30);
  const [phone, setPhone] = useState('081234567890');
  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Kelimutu');
  const [originPort, setOriginPort] = useState(PORT_LIST[0]);
  const [destinationPort, setDestinationPort] = useState(PORT_LIST[1]);
  const [departureDate, setDepartureDate] = useState('2026-10-02 08:00');
  const [cabinClass, setCabinClass] = useState<CabinClass>('Ekonomi');
  const [seatNumber, setSeatNumber] = useState('DEK-E-01');
  const [ticketPrice, setTicketPrice] = useState(350000);
  const [luggageKg, setLuggageKg] = useState(15);
  const [status, setStatus] = useState<PassengerStatus>('Check-in');

  const openAdd = () => {
    const randomTicket = `TKT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    setTicketNumber(randomTicket);
    setName('');
    setNik(`317${Math.floor(1000000000000 + Math.random() * 9000000000000)}`);
    setGender('Laki-laki');
    setAge(28);
    setPhone('081' + Math.floor(10000000 + Math.random() * 90000000));
    setVesselName(vessels[0]?.name || 'KM Kelimutu');
    setOriginPort(PORT_LIST[0]);
    setDestinationPort(PORT_LIST[1]);
    setDepartureDate(new Date().toISOString().replace('T', ' ').substring(0, 16));
    setCabinClass('Ekonomi');
    setSeatNumber('DEK-E-' + Math.floor(10 + Math.random() * 89));
    setTicketPrice(350000);
    setLuggageKg(15);
    setStatus('Check-in');
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Sync propAddOpen if triggered from parent
  React.useEffect(() => {
    if (propAddOpen) {
      openAdd();
      if (onCloseAddModal) onCloseAddModal();
    }
  }, [propAddOpen]);

  const openEdit = (p: Passenger) => {
    setEditingId(p.id);
    setTicketNumber(p.ticketNumber);
    setName(p.name);
    setNik(p.nik);
    setGender(p.gender);
    setAge(p.age);
    setPhone(p.phone);
    setVesselName(p.vesselName);
    setOriginPort(p.originPort);
    setDestinationPort(p.destinationPort);
    setDepartureDate(p.departureDate);
    setCabinClass(p.cabinClass);
    setSeatNumber(p.seatNumber);
    setTicketPrice(p.ticketPrice);
    setLuggageKg(p.luggageKg);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nik.trim()) return;

    const matchedVessel = vessels.find(v => v.name === vesselName);

    if (editingId) {
      await updatePassenger(editingId, {
        ticketNumber,
        name,
        nik,
        gender,
        age: Number(age),
        phone,
        vesselId: matchedVessel?.id || 'ves-001',
        vesselName,
        originPort,
        destinationPort,
        departureDate,
        cabinClass,
        seatNumber,
        ticketPrice: Number(ticketPrice),
        luggageKg: Number(luggageKg),
        status
      });
    } else {
      await addPassenger({
        ticketNumber,
        name,
        nik,
        gender,
        age: Number(age),
        phone,
        vesselId: matchedVessel?.id || 'ves-001',
        vesselName,
        originPort,
        destinationPort,
        departureDate,
        cabinClass,
        seatNumber,
        ticketPrice: Number(ticketPrice),
        luggageKg: Number(luggageKg),
        status
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickBoarding = async (p: Passenger) => {
    const nextStatus: PassengerStatus = p.status === 'Sudah Boarding' ? 'Check-in' : 'Sudah Boarding';
    await updatePassenger(p.id, { status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    await deletePassenger(id);
    setDeleteConfirmId(null);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Filter passengers
  const filtered = passengers.filter(p => {
    const matchShip = activeShipFilter === 'Semua Kapal' || p.vesselName === activeShipFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.nik.includes(search) ||
      p.vesselName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;
    const matchClass = classFilter === 'Semua' || p.cabinClass === classFilter;
    return matchShip && matchSearch && matchStatus && matchClass;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Manifest Penumpang &amp; Tiket Kapal Laut
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen data manifest penumpang, cetak tiket barcode, validasi NIK, dan kontrol status boarding
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Penumpang Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, tiket, NIK penumpang..."
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
            <option value="Semua">Semua Status Boarding</option>
            <option value="Sudah Boarding">Sudah Boarding</option>
            <option value="Check-in">Check-in</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Batal">Batal</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="Semua">Semua Kelas Kabin</option>
            <option value="VIP">VIP</option>
            <option value="Kelas 1">Kelas 1</option>
            <option value="Bisnis">Bisnis</option>
            <option value="Ekonomi">Ekonomi</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Nama Penumpang &amp; NIK</th>
                <th className="py-3 px-4">Kapal &amp; Rute</th>
                <th className="py-3 px-4">Kelas &amp; Kursi</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Status Boarding</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data manifest penumpang yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {p.ticketNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        NIK: {p.nik} • {p.gender}, {p.age} th
                      </div>
                      <div className="text-[10px] text-slate-500">
                        HP: {p.phone} • Bagasi: {p.luggageKg} kg
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-sky-400" />
                        <span>{p.vesselName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.originPort} → {p.destinationPort}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.departureDate}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.cabinClass}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Kursi: {p.seatNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {formatRupiah(p.ticketPrice)}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleQuickBoarding(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition ${
                          p.status === 'Sudah Boarding'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : p.status === 'Check-in'
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                            : p.status === 'Menunggu'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                        title="Klik untuk ubah status Boarding"
                      >
                        {p.status === 'Sudah Boarding' && <CheckCircle2 className="w-3 h-3" />}
                        <span>{p.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewTicket(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition"
                          title="Lihat Tiket / Cetak Boarding Pass"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                          title="Edit Penumpang"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Hapus Penumpang"
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

      {/* Ticket / Boarding Pass Printable Preview Modal */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full text-white shadow-2xl my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Boarding Pass Resmi Penumpang</span>
              </div>
              <button
                onClick={() => setViewTicket(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Boarding Pass Paper Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-lg relative border-dashed border-2 border-slate-300">
              
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">KEMENTERIAN PERHUBUNGAN LAUT</span>
                  <h3 className="text-base font-extrabold text-sky-900">{viewTicket.vesselName}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-700">{viewTicket.ticketNumber}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                    {viewTicket.cabinClass}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Nama Penumpang</span>
                  <span className="font-bold text-slate-900">{viewTicket.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">NIK / Identitas</span>
                  <span className="font-mono font-semibold text-slate-800">{viewTicket.nik}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Rute Pelayaran</span>
                  <span className="font-semibold text-slate-800">{viewTicket.originPort} → {viewTicket.destinationPort}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Jadwal Keberangkatan</span>
                  <span className="font-mono font-semibold text-slate-800">{viewTicket.departureDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Nomor Tempat Duduk</span>
                  <span className="font-mono text-base font-bold text-emerald-700">{viewTicket.seatNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tarif Tiket</span>
                  <span className="font-bold text-slate-800">{formatRupiah(viewTicket.ticketPrice)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-500">STATUS MANIFEST:</div>
                  <div className="font-bold text-xs text-emerald-600 uppercase">{viewTicket.status}</div>
                </div>
                {/* Barcode representation */}
                <div className="flex flex-col items-center">
                  <div className="h-7 w-32 bg-slate-800 flex items-center justify-center text-[9px] text-white font-mono tracking-widest">
                    ||||| | |||| ||| ||||
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5">{viewTicket.ticketNumber}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Valid untuk boarding dermaga kapal</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Boarding Pass</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl">
            <h3 className="font-bold text-base text-rose-400 mb-2">Hapus Manifest Penumpang?</h3>
            <p className="text-xs text-slate-300 mb-4">
              Data tiket dan manifest ini akan dihapus dari sistem dan database Firestore secara permanen.
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
                <Users className="w-5 h-5 text-emerald-400" />
                {editingId ? 'Edit Data Manifest Penumpang' : 'Input Manifest Penumpang Baru'}
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
                  <label className="block text-slate-300 mb-1 font-medium">Nomor Tiket *</label>
                  <input
                    type="text"
                    required
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nama Lengkap Penumpang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai KTP / Paspor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nomor Induk Kependudukan (NIK) *</label>
                  <input
                    type="text"
                    required
                    placeholder="16 digit NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as PassengerGender)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Usia (Tahun)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
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
                  <label className="block text-slate-300 mb-1 font-medium">Waktu Keberangkatan</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kelas Kabin</label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Bisnis">Bisnis</option>
                    <option value="Ekonomi">Ekonomi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nomor Kursi / Kabin</label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tarif Tiket (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status Boarding *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PassengerStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Check-in">Check-in</option>
                    <option value="Sudah Boarding">Sudah Boarding</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Bagasi Tambahan (Kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={luggageKg}
                    onChange={(e) => setLuggageKg(Number(e.target.value))}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Tiket & Simpan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
