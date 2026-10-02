/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShipDataProvider } from './context/ShipDataContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { LiveTrackingRadar } from './components/LiveTrackingRadar';
import { VesselMasterData } from './components/VesselMasterData';
import { PassengerManifest } from './components/PassengerManifest';
import { CargoManifest } from './components/CargoManifest';
import { VoyageSchedule } from './components/VoyageSchedule';
import { TrackingHistory } from './components/TrackingHistory';
import { ReportsView } from './components/ReportsView';
import { LoginModal } from './components/LoginModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Quick action triggers from Dashboard to other tabs
  const [triggerNewPassenger, setTriggerNewPassenger] = useState(false);
  const [triggerNewCargo, setTriggerNewCargo] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-sky-400">Menghubungkan ke Database LogiShip...</p>
        <p className="text-xs text-slate-500 mt-1">Menginisialisasi Firebase Cloud Firestore</p>
      </div>
    );
  }

  // REQUIREMENT: "DAN SEBELUM MASUK APLIKASINYA HARUS ADA FROM LOGINYA"
  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar onOpenDbStatus={() => setIsDbModalOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-6">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenDbStatus={() => setIsDbModalOpen(true)} 
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab}
              onOpenNewPassenger={() => {
                setActiveTab('passengers');
                setTriggerNewPassenger(true);
              }}
              onOpenNewCargo={() => {
                setActiveTab('cargos');
                setTriggerNewCargo(true);
              }}
              onOpenNewVessel={() => {
                setActiveTab('vessels');
              }}
            />
          )}

          {activeTab === 'radar' && <LiveTrackingRadar />}
          {activeTab === 'vessels' && <VesselMasterData />}
          
          {activeTab === 'passengers' && (
            <PassengerManifest 
              isAddModalOpen={triggerNewPassenger}
              onCloseAddModal={() => setTriggerNewPassenger(false)}
            />
          )}

          {activeTab === 'cargos' && (
            <CargoManifest 
              isAddModalOpen={triggerNewCargo}
              onCloseAddModal={() => setTriggerNewCargo(false)}
            />
          )}

          {activeTab === 'schedules' && <VoyageSchedule />}
          {activeTab === 'tracking' && <TrackingHistory />}
          {activeTab === 'reports' && <ReportsView />}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Real Database Connection Modal */}
      <DatabaseStatusModal 
        isOpen={isDbModalOpen} 
        onClose={() => setIsDbModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShipDataProvider>
        <AppContent />
      </ShipDataProvider>
    </AuthProvider>
  );
}
