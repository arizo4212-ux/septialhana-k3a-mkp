import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Ship, 
  Users, 
  Package, 
  DollarSign, 
  CheckCircle 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { vessels, passengers, cargos, activeShipFilter } = useShipData();
  const [selectedVessel, setSelectedVessel] = useState(activeShipFilter !== 'Semua Kapal' ? activeShipFilter : 'Semua Kapal');
  const [reportType, setReportType] = useState<'semua' | 'penumpang' | 'kargo'>('semua');

  const filteredPassengers = selectedVessel === 'Semua Kapal'
    ? passengers
    : passengers.filter(p => p.vesselName === selectedVessel);

  const filteredCargos = selectedVessel === 'Semua Kapal'
    ? cargos
    : cargos.filter(c => c.vesselName === selectedVessel);

  const totalPassengerRevenue = filteredPassengers.reduce((sum, p) => sum + p.ticketPrice, 0);
  const totalCargoRevenue = filteredCargos.reduce((sum, c) => sum + c.freightFee, 0);
  const totalRevenue = totalPassengerRevenue + totalCargoRevenue;

  const totalCargoWeight = filteredCargos.reduce((sum, c) => sum + c.weightTon, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Export CSV for Passengers
  const handleExportPassengerCSV = () => {
    const headers = ['No. Tiket', 'Nama Lengkap', 'NIK', 'Gender', 'Usia', 'Kapal', 'Asal', 'Tujuan', 'Kelas', 'Kursi', 'Tarif', 'Status'];
    const rows = filteredPassengers.map(p => [
      p.ticketNumber,
      `"${p.name}"`,
      `'${p.nik}`,
      p.gender,
      p.age,
      `"${p.vesselName}"`,
      `"${p.originPort}"`,
      `"${p.destinationPort}"`,
      p.cabinClass,
      p.seatNumber,
      p.ticketPrice,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manifest_Penumpang_${selectedVessel.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Cargo
  const handleExportCargoCSV = () => {
    const headers = ['No. B/L', 'Pengirim', 'Penerima', 'Jenis Kargo', 'Deskripsi', 'Berat (Ton)', 'Volume (CBM)', 'No. Unit', 'Kapal', 'Palka', 'Asal', 'Tujuan', 'Tarif', 'Status'];
    const rows = filteredCargos.map(c => [
      c.billOfLading,
      `"${c.shipper}"`,
      `"${c.consignee}"`,
      `"${c.cargoType}"`,
      `"${c.itemDescription}"`,
      c.weightTon,
      c.volumeCbm,
      `"${c.containerOrVehicleNo}"`,
      `"${c.vesselName}"`,
      `"${c.deckPosition}"`,
      `"${c.originPort}"`,
      `"${c.destinationPort}"`,
      c.freightFee,
      c.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Manifest_Muatan_Kargo_${selectedVessel.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Laporan Rekapitulasi &amp; Manifest Resmi Syahbandar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cetak dokumen manifest sah, rekapitulasi finansial angkutan laut, dan unduh format CSV resmi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportPassengerCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Penumpang</span>
          </button>
          <button
            onClick={handleExportCargoCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV Kargo</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Pilih Kapal:
          </span>
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="Semua Kapal">Semua Armada ({vessels.length} Kapal)</option>
            {vessels.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('semua')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'semua' ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua Laporan
          </button>
          <button
            onClick={() => setReportType('penumpang')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'penumpang' ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Khusus Penumpang
          </button>
          <button
            onClick={() => setReportType('kargo')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'kargo' ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Khusus Kargo
          </button>
        </div>
      </div>

      {/* Financial & Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs mb-1">Total Pendapatan Tiket</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {formatRupiah(totalPassengerRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Dari {filteredPassengers.length} tiket manifest
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs mb-1">Total Uang Tambang (Freight)</div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {formatRupiah(totalCargoRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Dari {filteredCargos.length} resi muatan B/L
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs mb-1">Total Muatan Terangkut</div>
          <div className="text-xl font-bold text-white font-mono">
            {totalCargoWeight.toFixed(1)} Ton
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Volume: {filteredCargos.reduce((s, c) => s + c.volumeCbm, 0)} CBM
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs mb-1">Total Omset Gabungan</div>
          <div className="text-xl font-bold text-sky-400 font-mono">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tiket Penumpang + Kargo Palka
          </div>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-300 text-xs space-y-6">
        
        {/* Document Header (Kop Surat Resmi) */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA
          </h2>
          <h3 className="text-base font-black uppercase text-slate-950">
            DIREKTORAT JENDERAL PERHUBUNGAN LAUT - KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN
          </h3>
          <p className="text-[10px] text-slate-600 font-mono">
            SISTEM MANIFEST RESMI ANGKUTAN LAUT NASIONAL (LOGISHIP OPERATIONAL SYSTEM)
          </p>
        </div>

        {/* Report Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Armada Kapal</span>
            <span className="font-bold text-slate-900">{selectedVessel}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Tanggal Cetak</span>
            <span className="font-mono text-slate-800">{new Date().toISOString().substring(0, 10)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Penumpang</span>
            <span className="font-bold text-slate-900">{filteredPassengers.length} Orang</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Tonase Kargo</span>
            <span className="font-bold text-slate-900">{totalCargoWeight.toFixed(1)} Ton</span>
          </div>
        </div>

        {/* Section 1: Passenger Manifest Table */}
        {(reportType === 'semua' || reportType === 'penumpang') && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Manifest Penumpang Kapal
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border border-slate-300">No.</th>
                  <th className="p-2 border border-slate-300">No. Tiket</th>
                  <th className="p-2 border border-slate-300">Nama Penumpang</th>
                  <th className="p-2 border border-slate-300">NIK</th>
                  <th className="p-2 border border-slate-300">Kapal</th>
                  <th className="p-2 border border-slate-300">Kelas &amp; Kursi</th>
                  <th className="p-2 border border-slate-300">Tarif</th>
                  <th className="p-2 border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPassengers.map((p, idx) => (
                  <tr key={p.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 font-mono text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-semibold">{p.ticketNumber}</td>
                    <td className="p-2 border border-slate-300 font-semibold">{p.name}</td>
                    <td className="p-2 border border-slate-300 font-mono">{p.nik}</td>
                    <td className="p-2 border border-slate-300">{p.vesselName}</td>
                    <td className="p-2 border border-slate-300">{p.cabinClass} ({p.seatNumber})</td>
                    <td className="p-2 border border-slate-300 font-mono">{formatRupiah(p.ticketPrice)}</td>
                    <td className="p-2 border border-slate-300 font-semibold text-emerald-700">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 2: Cargo Manifest Table */}
        {(reportType === 'semua' || reportType === 'kargo') && (
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              Manifest Muatan Kargo &amp; Barang Logistik
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border border-slate-300">No.</th>
                  <th className="p-2 border border-slate-300">No. B/L</th>
                  <th className="p-2 border border-slate-300">Pengirim / Shipper</th>
                  <th className="p-2 border border-slate-300">Penerima / Consignee</th>
                  <th className="p-2 border border-slate-300">Jenis &amp; No. Unit</th>
                  <th className="p-2 border border-slate-300">Berat</th>
                  <th className="p-2 border border-slate-300">Palka</th>
                  <th className="p-2 border border-slate-300">Tarif Freight</th>
                  <th className="p-2 border border-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargos.map((c, idx) => (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 font-mono text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-semibold">{c.billOfLading}</td>
                    <td className="p-2 border border-slate-300">{c.shipper}</td>
                    <td className="p-2 border border-slate-300">{c.consignee}</td>
                    <td className="p-2 border border-slate-300">{c.cargoType} ({c.containerOrVehicleNo})</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{c.weightTon} Ton</td>
                    <td className="p-2 border border-slate-300">{c.deckPosition}</td>
                    <td className="p-2 border border-slate-300 font-mono">{formatRupiah(c.freightFee)}</td>
                    <td className="p-2 border border-slate-300 font-semibold text-amber-700">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Box Syahbandar & Nahkoda */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-12">Mengetahui,<br /><span className="font-bold text-slate-800">PETUGAS SYAHBANDAR KSOP</span></p>
            <p className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.M.</p>
            <p className="text-[10px] text-slate-500">NIP. 19780512 200312 1 004</p>
          </div>
          <div>
            <p className="text-slate-500 mb-12">Diverifikasi &amp; Diterima,<br /><span className="font-bold text-slate-800">NAHKODA / PERWIRA DECK</span></p>
            <p className="font-bold underline text-slate-900">Capt. Hendra Wicaksono, M.Mar</p>
            <p className="text-[10px] text-slate-500">Master Mariner Reg. 04221</p>
          </div>
        </div>

      </div>

    </div>
  );
};
