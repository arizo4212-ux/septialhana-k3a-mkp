export type VesselStatus = 'Berlayar' | 'Bersandar' | 'Proses Muat' | 'Perbaikan';
export type VesselType = 'Penumpang & Ro-Ro' | 'Petikemas / Kontainer' | 'Kapal Cepat / Ferry' | 'Kargo Curah / General Cargo';

export interface Vessel {
  id: string;
  name: string;
  code: string;
  type: VesselType;
  passengerCapacity: number;
  cargoCapacityTon: number;
  callSign: string;
  captainName: string;
  status: VesselStatus;
  currentPort: string;
  destinationPort: string;
  speedKnots: number;
  lat: number;
  lng: number;
  updatedAt: string;
}

export type PassengerGender = 'Laki-laki' | 'Perempuan';
export type CabinClass = 'VIP' | 'Kelas 1' | 'Bisnis' | 'Ekonomi';
export type PassengerStatus = 'Sudah Boarding' | 'Check-in' | 'Menunggu' | 'Batal';

export interface Passenger {
  id: string;
  ticketNumber: string;
  name: string;
  nik: string;
  gender: PassengerGender;
  age: number;
  phone: string;
  vesselId: string;
  vesselName: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  cabinClass: CabinClass;
  seatNumber: string;
  ticketPrice: number;
  luggageKg: number;
  status: PassengerStatus;
  createdAt: string;
}

export type CargoType = 
  | 'Petikemas 20ft' 
  | 'Petikemas 40ft' 
  | 'Kendaraan Truk/Fuso' 
  | 'Kendaraan Pribadi/R4' 
  | 'Barang Umum / General Cargo' 
  | 'Curah / Bulk' 
  | 'Reefer / Berpendingin';

export type CargoStatus = 'Siap Muat' | 'Loading' | 'On-Board' | 'Bongkar' | 'Selesai' | 'Tertahan';

export interface Cargo {
  id: string;
  billOfLading: string;
  shipper: string;
  consignee: string;
  cargoType: CargoType;
  itemDescription: string;
  weightTon: number;
  volumeCbm: number;
  containerOrVehicleNo: string;
  vesselId: string;
  vesselName: string;
  deckPosition: string;
  originPort: string;
  destinationPort: string;
  freightFee: number;
  status: CargoStatus;
  hazardous: string;
  createdAt: string;
}

export type ScheduleStatus = 'Tepat Waktu' | 'Boarding' | 'Berlayar' | 'Tiba' | 'Ditunda' | 'Dibatalkan';

export interface Schedule {
  id: string;
  voyageNumber: string;
  vesselName: string;
  originPort: string;
  destinationPort: string;
  berth: string;
  departureTime: string;
  arrivalTime: string;
  status: ScheduleStatus;
  estimatedPassengers: number;
  estimatedCargoTon: number;
}

export type EventType = 
  | 'Keberangkatan' 
  | 'Kedatangan' 
  | 'Loading Crane' 
  | 'Check-in Penumpang' 
  | 'Izin Syahbandar (SPB)' 
  | 'Cuaca Laut' 
  | 'Inspeksi Palka';

export interface TrackingLog {
  id: string;
  vesselName: string;
  voyageNumber: string;
  eventType: EventType;
  description: string;
  location: string;
  officer: string;
  timestamp: string;
}

export interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  category: 'Muatan' | 'Penumpang' | 'Jadwal' | 'Cuaca' | 'Sistem';
  read: boolean;
  timestamp: string;
}

export type UserRole = 'Super Admin' | 'Petugas Manifest' | 'Supervisor Kargo' | 'Nahkoda / Perwira';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  port: string;
  avatar?: string;
  isFirebaseAuthenticated?: boolean;
}
