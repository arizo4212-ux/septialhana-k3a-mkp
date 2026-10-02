import React, { useState } from 'react';
import { useShipData } from '../context/ShipDataContext';
import { Vessel } from '../types';
import { 
  Compass, 
  Ship, 
  Radio, 
  Navigation, 
  MapPin, 
  Clock, 
  Wind, 
  Gauge, 
  CheckCircle2, 
  RefreshCw,
  Search
} from 'lucide-react';

export const LiveTrackingRadar: React.FC = () => {
  const { vessels, updateVessel, addTrackingLog } = useShipData();
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(vessels[0] || null);
  const [isPinging, setIsPinging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.currentPort.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ping AIS to simulate real-time coordinate and knot update
  const handleSimulateAIS = async () => {
    if (!selectedVessel) return;
    setIsPinging(true);

    const deltaLat = (Math.random() - 0.5) * 0.15;
    const deltaLng = (Math.random() - 0.5) * 0.2;
    const newSpeed = selectedVessel.status === 'Berlayar' 
      ? Math.max(12, Math.min(22, Number((selectedVessel.speedKnots + (Math.random() - 0.5) * 2).toFixed(1))))
      : 0;

    const newLat = Number((selectedVessel.lat + deltaLat).toFixed(4));
    const newLng = Number((selectedVessel.lng + deltaLng).toFixed(4));

    await updateVessel(selectedVessel.id, {
      lat: newLat,
      lng: newLng,
      speedKnots: newSpeed
    });

    await addTrackingLog({
      vesselName: selectedVessel.name,
      voyageNumber: 'AIS-PING',
      eventType: 'Inspeksi Palka',
      description: `Transponder AIS memperbarui posisi maritim: ${newLat}°, ${newLng}° pada kecepatan ${newSpeed} Knot.`,
      location: `Perairan Antara ${selectedVessel.currentPort} & ${selectedVessel.destinationPort}`,
      officer: 'Sistem Telemetri Satelit AIS',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setSelectedVessel(prev => ({
      ...prev,
      lat: newLat,
      lng: newLng,
      speedKnots: newSpeed
    }));

    setTimeout(() => {
      setIsPinging(false);
    }, 600);
  };

  // Convert lat/lng to percentage coordinates on visual archipelago map
  // Indonesia bounds roughly: Lat: 6N to 11S, Lng: 95E to 141E
  const getMapPosition = (lat: number, lng: number) => {
    const minLng = 95.0;
    const maxLng = 141.0;
    const minLat = -11.0;
    const maxLat = 6.0;

    const x = Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert lat for Y axis (north at top)
    const y = Math.min(90, Math.max(10, ((maxLat - lat) / (maxLat - minLat)) * 100));

    return { x, y };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
            </span>
            <h1 className="text-xl font-bold text-white">
              Radar &amp; Pelacakan Posisi Kapal Real-Time
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Sistem Pemantauan Terpadu AIS (Automatic Identification System) Maritim Nusantara
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateAIS}
            disabled={isPinging}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Update Posisi AIS Kapal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Visual Maritime Radar / Archipelago Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
            {/* Radar Header Info overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono font-medium">AIS RADAR SCANNER:</span>
              <span className="text-emerald-400 font-bold font-mono">156.800 MHz (VHF Ch 16)</span>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300">
              <span>Wilayah:</span>
              <span className="font-semibold text-white">Nusantara Indonesia</span>
            </div>

            {/* Radar Grid Graphic Viewport */}
            <div className="w-full h-[450px] relative bg-gradient-to-b from-slate-950 via-sky-950/20 to-slate-950 overflow-hidden flex items-center justify-center">
              
              {/* Radar concentric range rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[180px] h-[180px] rounded-full border border-sky-500/15" />
                <div className="w-[320px] h-[320px] rounded-full border border-sky-500/15" />
                <div className="w-[440px] h-[440px] rounded-full border border-sky-500/20" />
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-sky-500/15" />
                <div className="absolute h-full w-[1px] bg-sky-500/15" />
              </div>

              {/* Sweeping Radar Scanner Line */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30 origin-center animate-spin"
                style={{
                  animationDuration: '8s',
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(14, 165, 233, 0.4) 0deg, transparent 60deg, transparent 360deg)'
                }}
              />

              {/* Decorative Map Island Outlines & Sea Lane Annotations */}
              <div className="absolute inset-0 p-6 pointer-events-none text-slate-600 text-[10px] font-mono select-none">
                <span className="absolute top-20 left-12 opacity-40">SELAT MALAKA</span>
                <span className="absolute top-36 left-48 opacity-40">LAUT JAWA</span>
                <span className="absolute top-40 right-1/2 opacity-40">SELAT MAKASSAR</span>
                <span className="absolute top-28 right-36 opacity-40">LAUT MALUKU</span>
                <span className="absolute bottom-16 right-20 opacity-40">LAUT ARAFURA</span>
                <span className="absolute bottom-12 left-44 opacity-40">SAMUDRA HINDIA</span>
              </div>

              {/* Major Indonesian Ports Marks */}
              {[
                { name: 'Tj. Priok', x: 26, y: 65 },
                { name: 'Tj. Perak', x: 38, y: 70 },
                { name: 'Makassar', x: 53, y: 60 },
                { name: 'Balikpapan', x: 47, y: 45 },
                { name: 'Bitung', x: 65, y: 32 },
                { name: 'Sorong', x: 78, y: 44 },
                { name: 'Belawan', x: 12, y: 30 },
              ].map(pt => (
                <div 
                  key={pt.name}
                  className="absolute pointer-events-none flex items-center gap-1 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{pt.name}</span>
                </div>
              ))}

              {/* Vessels Pins on the Radar */}
              {vessels.map((v) => {
                const isSelected = selectedVessel?.id === v.id;
                const pos = getMapPosition(v.lat, v.lng);

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVessel(v)}
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    {/* Pulsing ring for active sailing vessels */}
                    {v.status === 'Berlayar' && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                    )}

                    <div className={`relative flex items-center justify-center p-2 rounded-xl transition-all shadow-xl ${
                      isSelected 
                        ? 'bg-sky-500 text-white scale-125 ring-4 ring-sky-400/40 z-40' 
                        : v.status === 'Berlayar'
                        ? 'bg-emerald-600 text-white hover:scale-115'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:scale-110'
                    }`}>
                      <Ship className="w-4 h-4" />
                    </div>

                    {/* Ship Name Label Tooltip */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none transition ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold opacity-100 z-50'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 opacity-80 group-hover:opacity-100'
                    }`}>
                      {v.name} ({v.speedKnots} kn)
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Radar Controls Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Berlayar ({vessels.filter(v => v.status === 'Berlayar').length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  Bersandar ({vessels.filter(v => v.status === 'Bersandar').length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Proses Muat ({vessels.filter(v => v.status === 'Proses Muat').length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Satelit: INMARSAT-C • Stasiun Pantai VTS
              </span>
            </div>
          </div>

          {/* Quick list of vessels to click */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Pilih Kapal Terlacak:
              </div>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari armada..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg pl-8 pr-2 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredVessels.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVessel(v)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedVessel?.id === v.id
                      ? 'bg-sky-600/20 border-sky-500 text-white font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs truncate">{v.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{v.type}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    v.status === 'Berlayar' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {v.speedKnots} kn
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Selected Vessel Detail Telemetry Card (4 cols) */}
        <div className="lg:col-span-4">
          {selectedVessel ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">
                    TELEMETRI KAPAL AKTIF
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedVessel.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Call Sign: {selectedVessel.callSign} • Kode: {selectedVessel.code}
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                  selectedVessel.status === 'Berlayar'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : selectedVessel.status === 'Proses Muat'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                }`}>
                  {selectedVessel.status}
                </span>
              </div>

              {/* Speed & Heading Gauge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kecepatan (SOG)</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {selectedVessel.speedKnots}
                  </div>
                  <div className="text-[10px] text-slate-500">Knot (Mil Laut / Jam)</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>Haluan (COG)</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-sky-400">
                    {selectedVessel.status === 'Berlayar' ? '084° ENE' : 'Docked'}
                  </div>
                  <div className="text-[10px] text-slate-500">Derajat Kompas</div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1.5 text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Koordinat Terkini (WGS84)</span>
                </div>
                <div className="font-mono text-slate-200 font-semibold">
                  Lintang: {selectedVessel.lat.toFixed(4)}° S
                </div>
                <div className="font-mono text-slate-200 font-semibold">
                  Bujur: {selectedVessel.lng.toFixed(4)}° E
                </div>
              </div>

              {/* Route & Port */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-medium">Lintasan Rute Aktif:</div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Asal:</span>
                    <span className="font-semibold text-white">{selectedVessel.currentPort}</span>
                  </div>
                  <div className="w-full my-2 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-slate-700 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-500 p-1 rounded-full text-white">
                        <Ship className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tujuan:</span>
                    <span className="font-semibold text-sky-400">{selectedVessel.destinationPort}</span>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Jenis Kapal:</span>
                  <span className="text-slate-200 font-medium">{selectedVessel.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kapasitas Muatan:</span>
                  <span className="text-amber-300 font-mono font-medium">{selectedVessel.cargoCapacityTon} Ton</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Kapasitas Penumpang:</span>
                  <span className="text-emerald-300 font-mono font-medium">{selectedVessel.passengerCapacity} Orang</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nahkoda (Master):</span>
                  <span className="text-slate-200 font-medium">{selectedVessel.captainName}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleSimulateAIS}
                disabled={isPinging}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Simulasi Ping Telemetri Satelit</span>
              </button>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              Pilih salah satu armada kapal pada radar untuk memeriksa telemetri.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
