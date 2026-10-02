import React from 'react';
import { useShipData } from '../context/ShipDataContext';
import { 
  Ship, 
  Users, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  Anchor, 
  PlusCircle, 
  FileText, 
  Radio, 
  Clock, 
  Compass,
  Waves
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewPassenger: () => void;
  onOpenNewCargo: () => void;
  onOpenNewVessel: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setActiveTab, 
  onOpenNewPassenger, 
  onOpenNewCargo, 
  onOpenNewVessel 
}) => {
  const { vessels, passengers, cargos, schedules, trackingLogs, activeShipFilter } = useShipData();

  // Filter if activeShipFilter is selected
  const filteredVessels = activeShipFilter === 'Semua Kapal' 
    ? vessels 
    : vessels.filter(v => v.name === activeShipFilter);

  const filteredPassengers = activeShipFilter === 'Semua Kapal'
    ? passengers
    : passengers.filter(p => p.vesselName === activeShipFilter);

  const filteredCargos = activeShipFilter === 'Semua Kapal'
    ? cargos
    : cargos.filter(c => c.vesselName === activeShipFilter);

  // Calculations
  const totalPassengerCapacity = filteredVessels.reduce((acc, v) => acc + v.passengerCapacity, 0);
  const totalCargoCapacityTon = filteredVessels.reduce((acc, v) => acc + v.cargoCapacityTon, 0);

  const totalPassengers = filteredPassengers.length;
  const boardingPassengers = filteredPassengers.filter(p => p.status === 'Sudah Boarding').length;

  const totalCargoTon = filteredCargos.reduce((acc, c) => acc + c.weightTon, 0);
  const totalPassengerRevenue = filteredPassengers.reduce((acc, p) => acc + p.ticketPrice, 0);
  const totalCargoRevenue = filteredCargos.reduce((acc, c) => acc + c.freightFee, 0);
  const totalRevenue = totalPassengerRevenue + totalCargoRevenue;

  const cargoLoadFactor = totalCargoCapacityTon > 0 
    ? Math.min(100, Math.round((totalCargoTon / totalCargoCapacityTon) * 100))
    : 0;

  const passengerLoadFactor = totalPassengerCapacity > 0
    ? Math.min(100, Math.round((totalPassengers / totalPassengerCapacity) * 100))
    : 0;

  const sailingCount = filteredVessels.filter(v => v.status === 'Berlayar').length;
  const dockedCount = filteredVessels.filter(v => v.status === 'Bersandar').length;
  const loadingCount = filteredVessels.filter(v => v.status === 'Proses Muat').length;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SISTEM REAL-TIME ONLINE
              </span>
              <span className="text-xs text-slate-400">
                Pusat Kendali Operasi Maritim Nasional
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard Operasional Muatan &amp; Penumpang
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pemantauan terpusat kapasitas palka kargo, manifest penumpang, izin berlayar SPB, serta pergerakan kapal antar pelabuhan di seluruh Indonesia.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenNewPassenger}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Penumpang</span>
            </button>
            <button
              onClick={onOpenNewCargo}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>+ Kargo</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Cetak Manifest</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Armada Kapal */}
        <div 
          onClick={() => setActiveTab('vessels')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Armada Operasional</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{filteredVessels.length}</span>
            <span className="text-xs text-slate-400">Kapal</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">{sailingCount} Berlayar</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">{loadingCount} Muat</span>
            <span>•</span>
            <span>{dockedCount} Sandar</span>
          </div>
        </div>

        {/* Manifest Penumpang */}
        <div 
          onClick={() => setActiveTab('passengers')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Manifest Penumpang</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalPassengers}</span>
            <span className="text-xs text-slate-400">Jiwa</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-medium">{boardingPassengers} Boarding</span>
            <span className="text-slate-400">{passengerLoadFactor}% Kapasitas</span>
          </div>
        </div>

        {/* Muatan Kargo */}
        <div 
          onClick={() => setActiveTab('cargos')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Muatan &amp; Kargo Palka</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalCargoTon.toFixed(1)}</span>
            <span className="text-xs text-slate-400">Tonase</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-medium">{filteredCargos.length} Resi B/L</span>
            <span className="text-slate-400">{cargoLoadFactor}% Terisi</span>
          </div>
        </div>

        {/* Pendapatan Operasional */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Estimasi Pendapatan</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-xl font-bold text-white">{formatRupiah(totalRevenue)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Tiket + Uang Tambang Freight</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Capacity Load Factor & Live Vessel Radar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Capacity Gauges & Weather State (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Capacity Utilization Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-400" />
                Tingkat Utilisasi Muatan &amp; Kapal
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
            </div>

            {/* Cargo Load Bar */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  Kapasitas Palka Kargo
                </span>
                <span className="font-mono font-bold text-amber-400">{cargoLoadFactor}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cargoLoadFactor}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Terisi: {totalCargoTon.toFixed(1)} Ton</span>
                <span>Kapasitas: {totalCargoCapacityTon} Ton</span>
              </div>
            </div>

            {/* Passenger Load Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Kapasitas Manifest Penumpang
                </span>
                <span className="font-mono font-bold text-emerald-400">{passengerLoadFactor}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${passengerLoadFactor}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Terdaftar: {totalPassengers} Orang</span>
                <span>Kapasitas: {totalPassengerCapacity} Orang</span>
              </div>
            </div>

            {/* Vessel Status breakdown */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="font-bold text-emerald-400 text-base">{sailingCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sedang Berlayar</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="font-bold text-sky-400 text-base">{loadingCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Proses Muat</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <div className="font-bold text-slate-300 text-base">{dockedCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bersandar</div>
              </div>
            </div>
          </div>

          {/* Marine Weather & Ocean Conditions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-sky-400" />
                Kondisi Cuaca Maritim BMKG
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">
                UPDATE 19:00 WIB
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Laut Jawa (Priok - Perak)</div>
                  <div className="text-[11px] text-slate-400">Angin Timur Laut 12 - 16 knot</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold font-mono">0.8 - 1.2 m</div>
                  <div className="text-[10px] text-slate-400">Tenang / Aman</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/70 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Selat Makassar Bagian Tengah</div>
                  <div className="text-[11px] text-slate-400">Kecepatan Angin 18 - 22 knot</div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-bold font-mono">1.8 - 2.5 m</div>
                  <div className="text-[10px] text-amber-300">Waspada Kapal Roro</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Perairan Kepulauan Maluku &amp; Sorong</div>
                  <div className="text-[11px] text-slate-400">Angin Tenggara 10 - 14 knot</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold font-mono">1.0 - 1.5 m</div>
                  <div className="text-[10px] text-slate-400">Kondusif</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Fleet Status & Radar Preview & Live Schedules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Fleet Real-Time Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Status Armada Kapal Berlayar &amp; Sandar
                </h3>
                <p className="text-xs text-slate-400">Pelacakan kecepatan (knot), koordinat, dan pelabuhan tujuan</p>
              </div>
              <button
                onClick={() => setActiveTab('radar')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
              >
                <span>Buka Radar Lengkap</span>
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredVessels.slice(0, 4).map((v) => {
                const getStatusColor = (st: string) => {
                  switch (st) {
                    case 'Berlayar': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                    case 'Proses Muat': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                    case 'Bersandar': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
                    default: return 'bg-slate-700 text-slate-300 border-slate-600';
                  }
                };

                return (
                  <div 
                    key={v.id}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{v.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({v.code})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(v.status)}`}>
                            {v.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                          <span>{v.currentPort}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-sky-300 font-medium">{v.destinationPort}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Nahkoda: {v.captainName}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/60">
                      <div className="font-mono text-xs font-semibold text-emerald-400">
                        {v.speedKnots > 0 ? `${v.speedKnots} Knot` : '0 Knot (Dock)'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {v.lat.toFixed(2)}°, {v.lng.toFixed(2)}°
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Kargo: {v.cargoCapacityTon} T • Penumpang: {v.passengerCapacity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voyage Schedules snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Jadwal Keberangkatan Pelayaran Berikutnya
              </h3>
              <button
                onClick={() => setActiveTab('schedules')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Kelola Semua
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {schedules.slice(0, 3).map((sch) => (
                <div key={sch.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{sch.vesselName}</div>
                    <div className="text-[11px] text-slate-400">
                      {sch.originPort} → {sch.destinationPort} ({sch.berth})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-slate-200">{sch.departureTime}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      {sch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Recent Tracking Logs audit trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Histori Pelacakan Aktivitas Pelayaran Terkini
            </h3>
            <p className="text-xs text-slate-400">Audit log resmi keberangkatan, crane loading, dan izin Syahbandar</p>
          </div>
          <button
            onClick={() => setActiveTab('tracking')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium"
          >
            Lihat Histori Lengkap →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trackingLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300">{log.vesselName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
              <div className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
                {log.eventType}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {log.description}
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-700/40 flex items-center justify-between">
                <span>{log.location}</span>
                <span>{log.officer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
