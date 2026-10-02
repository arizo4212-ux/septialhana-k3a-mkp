import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Vessel, 
  Passenger, 
  Cargo, 
  Schedule, 
  TrackingLog, 
  OperationalNotification 
} from '../types';
import { 
  db, 
  OperationType, 
  handleFirestoreError, 
  testConnection 
} from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';
import { 
  INITIAL_VESSELS, 
  INITIAL_PASSENGERS, 
  INITIAL_CARGOS, 
  INITIAL_SCHEDULES, 
  INITIAL_TRACKING_LOGS, 
  INITIAL_NOTIFICATIONS 
} from '../lib/seedData';
import { useAuth } from './AuthContext';

interface ShipDataContextType {
  vessels: Vessel[];
  passengers: Passenger[];
  cargos: Cargo[];
  schedules: Schedule[];
  trackingLogs: TrackingLog[];
  notifications: OperationalNotification[];
  dbConnected: boolean;
  isLoadingData: boolean;
  activeShipFilter: string;
  setActiveShipFilter: (shipName: string) => void;

  // CRUD Vessels
  addVessel: (vessel: Omit<Vessel, 'id' | 'updatedAt'>) => Promise<void>;
  updateVessel: (id: string, updates: Partial<Vessel>) => Promise<void>;
  deleteVessel: (id: string) => Promise<void>;

  // CRUD Passengers
  addPassenger: (passenger: Omit<Passenger, 'id' | 'createdAt'>) => Promise<void>;
  updatePassenger: (id: string, updates: Partial<Passenger>) => Promise<void>;
  deletePassenger: (id: string) => Promise<void>;

  // CRUD Cargos
  addCargo: (cargo: Omit<Cargo, 'id' | 'createdAt'>) => Promise<void>;
  updateCargo: (id: string, updates: Partial<Cargo>) => Promise<void>;
  deleteCargo: (id: string) => Promise<void>;

  // CRUD Schedules
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Tracking Logs
  addTrackingLog: (log: Omit<TrackingLog, 'id'>) => Promise<void>;
  deleteTrackingLog: (id: string) => Promise<void>;

  // Notifications
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  triggerSimulatedAlert: () => Promise<void>;
  resetDatabaseWithDefaultData: () => Promise<void>;
}

const ShipDataContext = createContext<ShipDataContextType | undefined>(undefined);

export const ShipDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [passengers, setPassengers] = useState<Passenger[]>(INITIAL_PASSENGERS);
  const [cargos, setCargos] = useState<Cargo[]>(INITIAL_CARGOS);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>(INITIAL_TRACKING_LOGS);
  const [notifications, setNotifications] = useState<OperationalNotification[]>(INITIAL_NOTIFICATIONS);

  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [activeShipFilter, setActiveShipFilter] = useState<string>('Semua Kapal');

  // Seed default collections into Firestore if empty
  const seedIfEmpty = useCallback(async () => {
    try {
      const vSnap = await getDocs(collection(db, 'vessels'));
      if (vSnap.empty) {
        console.log('Seeding initial vessels into Firestore...');
        for (const item of INITIAL_VESSELS) {
          await setDoc(doc(db, 'vessels', item.id), item);
        }
      }

      const pSnap = await getDocs(collection(db, 'passengers'));
      if (pSnap.empty) {
        console.log('Seeding initial passengers into Firestore...');
        for (const item of INITIAL_PASSENGERS) {
          await setDoc(doc(db, 'passengers', item.id), item);
        }
      }

      const cSnap = await getDocs(collection(db, 'cargos'));
      if (cSnap.empty) {
        console.log('Seeding initial cargos into Firestore...');
        for (const item of INITIAL_CARGOS) {
          await setDoc(doc(db, 'cargos', item.id), item);
        }
      }

      const sSnap = await getDocs(collection(db, 'schedules'));
      if (sSnap.empty) {
        console.log('Seeding initial schedules into Firestore...');
        for (const item of INITIAL_SCHEDULES) {
          await setDoc(doc(db, 'schedules', item.id), item);
        }
      }

      const lSnap = await getDocs(collection(db, 'tracking_logs'));
      if (lSnap.empty) {
        console.log('Seeding initial tracking logs into Firestore...');
        for (const item of INITIAL_TRACKING_LOGS) {
          await setDoc(doc(db, 'tracking_logs', item.id), item);
        }
      }

      const nSnap = await getDocs(collection(db, 'notifications'));
      if (nSnap.empty) {
        console.log('Seeding initial notifications into Firestore...');
        for (const item of INITIAL_NOTIFICATIONS) {
          await setDoc(doc(db, 'notifications', item.id), item);
        }
      }
    } catch (err) {
      console.warn('Seed operation caught error (might be offline or rule constraints):', err);
    }
  }, []);

  // Listen to Firestore changes via onSnapshot
  useEffect(() => {
    testConnection().then(connected => setDbConnected(connected));

    if (!isAuthenticated) return;

    setIsLoadingData(true);
    seedIfEmpty();

    const unsubVessels = onSnapshot(collection(db, 'vessels'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Vessel));
        setVessels(items);
      }
      setIsLoadingData(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vessels');
    });

    const unsubPassengers = onSnapshot(collection(db, 'passengers'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Passenger));
        setPassengers(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'passengers');
    });

    const unsubCargos = onSnapshot(collection(db, 'cargos'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cargo));
        setCargos(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'cargos');
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Schedule));
        setSchedules(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'schedules');
    });

    const unsubLogs = onSnapshot(collection(db, 'tracking_logs'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrackingLog));
        setTrackingLogs(items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracking_logs');
    });

    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OperationalNotification));
        setNotifications(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => {
      unsubVessels();
      unsubPassengers();
      unsubCargos();
      unsubSchedules();
      unsubLogs();
      unsubNotifs();
    };
  }, [isAuthenticated, seedIfEmpty]);

  // CRUD Vessels
  const addVessel = async (data: Omit<Vessel, 'id' | 'updatedAt'>) => {
    const id = 'ves-' + Date.now().toString(36);
    const newDoc: Vessel = {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };
    
    // Immediate state update so UI reflects the addition instantly
    setVessels(prev => [newDoc, ...prev.filter(v => v.id !== id)]);

    try {
      await setDoc(doc(db, 'vessels', id), newDoc);

      // Add auto tracking log
      await addTrackingLog({
        vesselName: newDoc.name,
        voyageNumber: 'SYS-INIT',
        eventType: 'Inspeksi Palka',
        description: `Armada baru ${newDoc.name} (${newDoc.code}) berhasil didaftarkan ke sistem operasional.`,
        location: newDoc.currentPort,
        officer: 'Sistem Admin',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    } catch (err) {
      console.error('Firestore save vessel error:', err);
    }
  };

  const updateVessel = async (id: string, updates: Partial<Vessel>) => {
    const updatedItem = { ...updates, updatedAt: new Date().toISOString() };
    setVessels(prev => prev.map(v => v.id === id ? { ...v, ...updatedItem } : v));
    try {
      await updateDoc(doc(db, 'vessels', id), updatedItem);
    } catch (err) {
      console.error('Firestore update vessel error:', err);
    }
  };

  const deleteVessel = async (id: string) => {
    setVessels(prev => prev.filter(v => v.id !== id));
    try {
      await deleteDoc(doc(db, 'vessels', id));
    } catch (err) {
      console.error('Firestore delete vessel error:', err);
    }
  };

  // CRUD Passengers
  const addPassenger = async (data: Omit<Passenger, 'id' | 'createdAt'>) => {
    const id = 'pas-' + Date.now().toString(36);
    const newDoc: Passenger = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    // Immediate state update
    setPassengers(prev => [newDoc, ...prev.filter(p => p.id !== id)]);

    try {
      await setDoc(doc(db, 'passengers', id), newDoc);

      // Add automatic notification if boarding
      if (newDoc.status === 'Sudah Boarding') {
        const notifId = 'notif-' + Date.now().toString(36);
        const notif: OperationalNotification = {
          id: notifId,
          title: `Penumpang Baru Boarding: ${newDoc.name}`,
          message: `Tiket ${newDoc.ticketNumber} (${newDoc.cabinClass}) telah masuk ke kapal ${newDoc.vesselName}.`,
          type: 'info',
          category: 'Penumpang',
          read: false,
          timestamp: 'Baru saja'
        };
        await setDoc(doc(db, 'notifications', notifId), notif);
      }
    } catch (err) {
      console.error('Firestore save passenger error:', err);
    }
  };

  const updatePassenger = async (id: string, updates: Partial<Passenger>) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await updateDoc(doc(db, 'passengers', id), updates);
    } catch (err) {
      console.error('Firestore update passenger error:', err);
    }
  };

  const deletePassenger = async (id: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'passengers', id));
    } catch (err) {
      console.error('Firestore delete passenger error:', err);
    }
  };

  // CRUD Cargos
  const addCargo = async (data: Omit<Cargo, 'id' | 'createdAt'>) => {
    const id = 'crg-' + Date.now().toString(36);
    const newDoc: Cargo = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    // Immediate state update
    setCargos(prev => [newDoc, ...prev.filter(c => c.id !== id)]);

    try {
      await setDoc(doc(db, 'cargos', id), newDoc);

      // Add tracking log for loading
      await addTrackingLog({
        vesselName: newDoc.vesselName,
        voyageNumber: 'VOY-CRG',
        eventType: 'Loading Crane',
        description: `Muatan ${newDoc.cargoType} (${newDoc.weightTon} Ton) dari ${newDoc.shipper} terdaftar posisi ${newDoc.deckPosition}.`,
        location: newDoc.originPort,
        officer: 'Petugas Stevedoring Palka',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    } catch (err) {
      console.error('Firestore save cargo error:', err);
    }
  };

  const updateCargo = async (id: string, updates: Partial<Cargo>) => {
    setCargos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await updateDoc(doc(db, 'cargos', id), updates);
    } catch (err) {
      console.error('Firestore update cargo error:', err);
    }
  };

  const deleteCargo = async (id: string) => {
    setCargos(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'cargos', id));
    } catch (err) {
      console.error('Firestore delete cargo error:', err);
    }
  };

  // CRUD Schedules
  const addSchedule = async (data: Omit<Schedule, 'id'>) => {
    const id = 'sch-' + Date.now().toString(36);
    const newDoc: Schedule = { ...data, id };

    setSchedules(prev => [newDoc, ...prev.filter(s => s.id !== id)]);

    try {
      await setDoc(doc(db, 'schedules', id), newDoc);
    } catch (err) {
      console.error('Firestore save schedule error:', err);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    try {
      await updateDoc(doc(db, 'schedules', id), updates);
    } catch (err) {
      console.error('Firestore update schedule error:', err);
    }
  };

  const deleteSchedule = async (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'schedules', id));
    } catch (err) {
      console.error('Firestore delete schedule error:', err);
    }
  };

  // Tracking Logs
  const addTrackingLog = async (data: Omit<TrackingLog, 'id'>) => {
    const id = 'log-' + Date.now().toString(36);
    const newDoc: TrackingLog = { ...data, id };
    try {
      await setDoc(doc(db, 'tracking_logs', id), newDoc);
      setTrackingLogs(prev => [newDoc, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tracking_logs/${id}`);
    }
  };

  const deleteTrackingLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tracking_logs', id));
      setTrackingLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tracking_logs/${id}`);
    }
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const notif of notifications) {
      if (!notif.read) {
        try {
          await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        } catch {
          // ignore
        }
      }
    }
  };

  const triggerSimulatedAlert = async () => {
    const id = 'notif-' + Date.now().toString(36);
    const alerts = [
      {
        title: 'Peringatan Gelombang Tinggi Selat Sunda',
        message: 'Tinggi gelombang diprediksi mencapai 2.8 meter pada pukul 21:00. Seluruh kapal ferry Ro-Ro diimbau waspada.',
        type: 'alert' as const,
        category: 'Cuaca' as const
      },
      {
        title: 'Kapasitas Palka KM Kelimutu Telah Mencapai 94%',
        message: 'Sisa ruang muatan kargo curah tinggal 90 Ton. Sistem otomatis mengunci slot pemesanan baru.',
        type: 'warning' as const,
        category: 'Muatan' as const
      },
      {
        title: 'Izin Berlayar (SPB) KM Labobar Telah Diterbitkan',
        message: 'Syahbandar Makassar menyetujui izin berlayar pelayaran rute Makassar - Sorong tepat waktu.',
        type: 'success' as const,
        category: 'Jadwal' as const
      }
    ];

    const chosen = alerts[Math.floor(Math.random() * alerts.length)];
    const newNotif: OperationalNotification = {
      id,
      title: chosen.title,
      message: chosen.message,
      type: chosen.type,
      category: chosen.category,
      read: false,
      timestamp: 'Baru saja'
    };

    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
      setNotifications(prev => [newNotif, ...prev]);
    } catch {
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const resetDatabaseWithDefaultData = async () => {
    setIsLoadingData(true);
    try {
      for (const v of INITIAL_VESSELS) await setDoc(doc(db, 'vessels', v.id), v);
      for (const p of INITIAL_PASSENGERS) await setDoc(doc(db, 'passengers', p.id), p);
      for (const c of INITIAL_CARGOS) await setDoc(doc(db, 'cargos', c.id), c);
      for (const s of INITIAL_SCHEDULES) await setDoc(doc(db, 'schedules', s.id), s);
      for (const l of INITIAL_TRACKING_LOGS) await setDoc(doc(db, 'tracking_logs', l.id), l);
      for (const n of INITIAL_NOTIFICATIONS) await setDoc(doc(db, 'notifications', n.id), n);

      setVessels(INITIAL_VESSELS);
      setPassengers(INITIAL_PASSENGERS);
      setCargos(INITIAL_CARGOS);
      setSchedules(INITIAL_SCHEDULES);
      setTrackingLogs(INITIAL_TRACKING_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <ShipDataContext.Provider
      value={{
        vessels,
        passengers,
        cargos,
        schedules,
        trackingLogs,
        notifications,
        dbConnected,
        isLoadingData,
        activeShipFilter,
        setActiveShipFilter,
        addVessel,
        updateVessel,
        deleteVessel,
        addPassenger,
        updatePassenger,
        deletePassenger,
        addCargo,
        updateCargo,
        deleteCargo,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addTrackingLog,
        deleteTrackingLog,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerSimulatedAlert,
        resetDatabaseWithDefaultData
      }}
    >
      {children}
    </ShipDataContext.Provider>
  );
};

export const useShipData = () => {
  const context = useContext(ShipDataContext);
  if (!context) {
    throw new Error('useShipData must be used within a ShipDataProvider');
  }
  return context;
};
