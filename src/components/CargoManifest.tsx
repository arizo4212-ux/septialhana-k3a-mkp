import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { Cargo, CargoType, CargoStatus } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer, 
  Ship, 
  Truck, 
  FileCheck, 
  X, 
  AlertCircle,
  Container,
  Layers
} from 'lucide-react';
import { PORT_LIST } from '../lib/seedData';

interface CargoManifestProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const CargoManifest: React.FC<CargoManifestProps> = ({ 
  isAddModalOpen: propAddOpen, 
  onCloseAddModal 
}) => {
  const { cargos, vessels, addCargo, updateCargo, deleteCargo, activeShipFilter } = useShipData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewBill, setViewBill] = useState<Cargo | null>(null);

  // Form Fields
  const [billOfLading, setBillOfLading] = useState('');
  const [shipper, setShipper] = useState('');
  const [consignee, setConsignee] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('Petikemas 40ft');
  const [itemDescription, setItemDescription] = useState('');
  const [weightTon, setWeightTon] = useState(20);
  const [volumeCbm, setVolumeCbm] = useState(50);
  const [containerOrVehicleNo, setContainerOrVehicleNo] = useState('');
  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Kelimutu');
  const [deckPosition, setDeckPosition] = useState('Palka Utama #1');
  const [originPort, setOriginPort] = useState(PORT_LIST[0]);
  const [destinationPort, setDestinationPort] = useState(PORT_LIST[1]);
  const [freightFee, setFreightFee] = useState(12000000);
  const [status, setStatus] = useState<CargoStatus>('Siap Muat');
  const [hazardous, setHazardous] = useState('Non-B3');

  const openAdd = () => {
    const randomBL = `BL-${PORT_LIST[0].substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBillOfLading(randomBL);
    setShipper('');
    setConsignee('');
    setCargoType('Petikemas 40ft');
    setItemDescription('');
    setWeightTon(18);
    setVolumeCbm(45);
    setContainerOrVehicleNo(`MRTU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1 + Math.random() * 9)}`);
    setVesselName(vessels[0]?.name || 'KM Kelimutu');
    setDeckPosition('Palka Bawah #1');
    setOriginPort(PORT_LIST[0]);
    setDestinationPort(PORT_LIST[1]);
    setFreightFee(12500000);
    setStatus('Siap Muat');
    setHazardous('Non-B3');
    setEditingId(null);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (propAddOpen) {
      openAdd();
      if (onCloseAddModal) onCloseAddModal();
    }
  }, [propAddOpen]);

  const openEdit = (c: Cargo) => {
    setEditingId(c.id);
    setBillOfLading(c.billOfLading);
    setShipper(c.shipper);
    setConsignee(c.consignee);
    setCargoType(c.cargoType);
    setItemDescription(c.itemDescription);
    setWeightTon(c.weightTon);
    setVolumeCbm(c.volumeCbm);
    setContainerOrVehicleNo(c.containerOrVehicleNo);
    setVesselName(c.vesselName);
    setDeckPosition(c.deckPosition);
    setOriginPort(c.originPort);
    setDestinationPort(c.destinationPort);
    setFreightFee(c.freightFee);
    setStatus(c.status);
    setHazardous(c.hazardous);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billOfLading.trim() || !shipper.trim() || !consignee.trim()) return;

    const matchedVessel = vessels.find(v => v.name === vesselName);

    if (editingId) {
      await updateCargo(editingId, {
        billOfLading,
        shipper,
        consignee,
        cargoType,
        itemDescription,
        weightTon: Number(weightTon),
        volumeCbm: Number(volumeCbm),
        containerOrVehicleNo,
        vesselId: matchedVessel?.id || 'ves-001',
        vesselName,
        deckPosition,
        originPort,
        destinationPort,
        freightFee: Number(freightFee),
        status,
        hazardous
      });
    } else {
      await addCargo({
        billOfLading,
        shipper,
        consignee,
        cargoType,
        itemDescription,
        weightTon: Number(weightTon),
        volumeCbm: Number(volumeCbm),
        containerOrVehicleNo,
        vesselId: matchedVessel?.id || 'ves-001',
        vesselName,
        deckPosition,
        originPort,
        destinationPort,
        freightFee: Number(freightFee),
        status,
        hazardous
      });
    }

    setIsModalOpen(false);
  };

  const handleAdvanceStatus = async (c: Cargo) => {
    const cycle: Record<CargoStatus, CargoStatus> = {
      'Siap Muat': 'Loading',
      'Loading': 'On-Board',
      'On-Board': 'Bongkar',
      'Bongkar': 'Selesai',
      'Selesai': 'Siap Muat',
      'Tertahan': 'Siap Muat'
    };
    await updateCargo(c.id, { status: cycle[c.status] });
  };

  const handleDelete = async (id: string) => {
    await deleteCargo(id);
    setDeleteConfirmId(null);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filtered = cargos.filter(c => {
    const matchShip = activeShipFilter === 'Semua Kapal' || c.vesselName === activeShipFilter;
    const matchSearch = c.billOfLading.toLowerCase().includes(search.toLowerCase()) ||
      c.shipper.toLowerCase().includes(search.toLowerCase()) ||
      c.consignee.toLowerCase().includes(search.toLowerCase()) ||
      c.containerOrVehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      c.vesselName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || c.status === statusFilter;
    const matchType = typeFilter === 'Semua' || c.cargoType === typeFilter;
    return matchShip && matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Manifest Muatan Kargo &amp; Logistik Kapal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen Bill of Lading (B/L), kontainer TEUs, muatan curah, kendaraan, tonase, dan posisi palka kapal
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Input Muatan Kargo Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari B/L, Pengirim, Kontainer..."
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
            <option value="Semua">Semua Status Muat</option>
            <option value="Siap Muat">Siap Muat</option>
            <option value="Loading">Loading</option>
            <option value="On-Board">On-Board</option>
            <option value="Bongkar">Bongkar</option>
            <option value="Selesai">Selesai</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="Semua">Semua Jenis Kargo</option>
            <option value="Petikemas 20ft">Petikemas 20ft</option>
            <option value="Petikemas 40ft">Petikemas 40ft</option>
            <option value="Kendaraan Truk/Fuso">Kendaraan Truk/Fuso</option>
            <option value="Curah / Bulk">Curah / Bulk</option>
            <option value="Reefer / Berpendingin">Reefer / Berpendingin</option>
            <option value="Barang Umum / General Cargo">Barang Umum</option>
          </select>
        </div>
      </div>

      {/* Cargo Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. B/L &amp; Unit</th>
                <th className="py-3 px-4">Pengirim &amp; Penerima</th>
                <th className="py-3 px-4">Deskripsi &amp; Jenis</th>
                <th className="py-3 px-4">Tonase &amp; Posisi</th>
                <th className="py-3 px-4">Kapal &amp; Rute</th>
                <th className="py-3 px-4">Uang Tambang (Freight)</th>
                <th className="py-3 px-4">Status Muatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data manifest muatan kargo yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-400">{c.billOfLading}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.containerOrVehicleNo}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[160px]">{c.shipper}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        Kepada: {c.consignee}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.cargoType}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[180px]">
                        {c.itemDescription}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-300">
                        {c.weightTon} Ton
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {c.volumeCbm} CBM • {c.deckPosition}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-white font-medium flex items-center gap-1">
                        <Ship className="w-3.5 h-3.5 text-sky-400" />
                        <span>{c.vesselName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.originPort} → {c.destinationPort}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {formatRupiah(c.freightFee)}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleAdvanceStatus(c)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition ${
                          c.status === 'On-Board'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : c.status === 'Loading'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : c.status === 'Siap Muat'
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                        title="Klik untuk mengubah siklus status muat kargo"
                      >
                        <span>{c.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewBill(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                          title="Lihat Bill of Lading (B/L)"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                          title="Edit Kargo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Hapus Kargo"
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

      {/* Bill of Lading Preview Modal */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full text-white shadow-2xl my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">Dokumen Bill of Lading (B/L) Resmi</span>
              </div>
              <button
                onClick={() => setViewBill(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Paper */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-300 text-xs">
              <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black tracking-tight uppercase">BILL OF LADING (SURAT MUATAN KAPAL)</h2>
                  <p className="text-[10px] text-slate-500">PT PELAYARAN NASIONAL INDONESIA • DITJEN HUBLA</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-700">{viewBill.billOfLading}</div>
                  <span className="text-[10px] font-mono text-slate-500">TANGGAL: {viewBill.createdAt.substring(0, 10)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pengirim (Shipper)</span>
                  <div className="font-bold text-slate-900">{viewBill.shipper}</div>
                  <div className="text-[10px] text-slate-600">Pelabuhan Muat: {viewBill.originPort}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Penerima (Consignee)</span>
                  <div className="font-bold text-slate-900">{viewBill.consignee}</div>
                  <div className="text-[10px] text-slate-600">Pelabuhan Bongkar: {viewBill.destinationPort}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Armada Kapal</span>
                  <div className="font-semibold text-slate-800">{viewBill.vesselName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Posisi Palka</span>
                  <div className="font-mono font-semibold text-slate-800">{viewBill.deckPosition}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Muatan</span>
                  <div className="font-bold text-amber-600 uppercase">{viewBill.status}</div>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Rincian Barang &amp; Unit Kontainer</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{viewBill.itemDescription}</div>
                  <div className="text-[11px] text-slate-600 font-mono mt-1">
                    Jenis: {viewBill.cargoType} • No. Unit: {viewBill.containerOrVehicleNo}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 font-mono mt-1">
                    Berat Total: {viewBill.weightTon} Ton • Volume: {viewBill.volumeCbm} CBM
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Biaya Tambang (Freight):</span>
                  <span className="text-base font-black text-slate-900">{formatRupiah(viewBill.freightFee)}</span>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 mb-6">TANDA TANGAN NAHKODA / MUALIM I</div>
                  <div className="border-t border-slate-400 w-36 text-[9px] font-bold">SYAHBANDAR &amp; STEVEDORE</div>
                </div>
              </div>

            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen B/L</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl">
            <h3 className="font-bold text-base text-rose-400 mb-2">Hapus Manifest Kargo?</h3>
            <p className="text-xs text-slate-300 mb-4">
              Data muatan ini akan dihapus dari sistem dan database Firestore secara permanen.
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
                <Package className="w-5 h-5 text-amber-400" />
                {editingId ? 'Edit Data Manifest Kargo' : 'Input Manifest Kargo Baru'}
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
                  <label className="block text-slate-300 mb-1 font-medium">Nomor Bill of Lading (B/L) *</label>
                  <input
                    type="text"
                    required
                    value={billOfLading}
                    onChange={(e) => setBillOfLading(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">No. Kontainer / Plat Nomor Truk *</label>
                  <input
                    type="text"
                    required
                    placeholder="MRTU-402918-2 atau B 9912 UZ"
                    value={containerOrVehicleNo}
                    onChange={(e) => setContainerOrVehicleNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nama Pengirim (Shipper) *</label>
                  <input
                    type="text"
                    required
                    placeholder="PT / CV Pengirim"
                    value={shipper}
                    onChange={(e) => setShipper(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nama Penerima (Consignee) *</label>
                  <input
                    type="text"
                    required
                    placeholder="PT / CV Penerima"
                    value={consignee}
                    onChange={(e) => setConsignee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jenis Muatan Kargo *</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value as CargoType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Petikemas 20ft">Petikemas 20ft</option>
                    <option value="Petikemas 40ft">Petikemas 40ft</option>
                    <option value="Kendaraan Truk/Fuso">Kendaraan Truk/Fuso</option>
                    <option value="Kendaraan Pribadi/R4">Kendaraan Pribadi/R4</option>
                    <option value="Barang Umum / General Cargo">Barang Umum / General Cargo</option>
                    <option value="Curah / Bulk">Curah / Bulk</option>
                    <option value="Reefer / Berpendingin">Reefer / Berpendingin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Deskripsi Komoditas / Barang</label>
                  <input
                    type="text"
                    placeholder="contoh: Sembako, Ikan Beku, Mesin"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Berat (Ton) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={0.1}
                      value={weightTon}
                      onChange={(e) => setWeightTon(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Volume (CBM)</label>
                    <input
                      type="number"
                      min={1}
                      value={volumeCbm}
                      onChange={(e) => setVolumeCbm(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Armada Kapal Pengangkut *</label>
                  <select
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {vessels.map(v => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Posisi Penempatan di Palka / Dek</label>
                  <input
                    type="text"
                    placeholder="contoh: Palka #1, Car Deck #2"
                    value={deckPosition}
                    onChange={(e) => setDeckPosition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pelabuhan Muat</label>
                  <select
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {PORT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pelabuhan Bongkar</label>
                  <select
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {PORT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tarif Uang Tambang (Freight Fee Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    value={freightFee}
                    onChange={(e) => setFreightFee(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status Operasional Muat *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CargoStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Siap Muat">Siap Muat</option>
                    <option value="Loading">Loading Crane</option>
                    <option value="On-Board">On-Board Kapal</option>
                    <option value="Bongkar">Bongkar</option>
                    <option value="Selesai">Selesai</option>
                  </select>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/20 transition cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Manifest Kargo & B/L'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
