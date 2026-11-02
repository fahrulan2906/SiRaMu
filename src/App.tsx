import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { DashboardView } from './views/DashboardView';
import { SchoolsView } from './views/SchoolsView';
import { UploadView } from './views/UploadView';
import { IndicatorsView } from './views/IndicatorsView';
import { SchoolAnalysisView } from './views/SchoolAnalysisView';
import { CrossSchoolAnalysisView } from './views/CrossSchoolAnalysisView';
import { ActionPlansView } from './views/ActionPlansView';
import { MonitoringView } from './views/MonitoringView';
import { HistoryView } from './views/HistoryView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'sekolah':
        return <SchoolsView />;
      case 'unggah':
        return <UploadView />;
      case 'indikator':
        return <IndicatorsView />;
      case 'analisis-sekolah':
        return <SchoolAnalysisView />;
      case 'analisis-lintas':
        return <CrossSchoolAnalysisView />;
      case 'rencana-pendampingan':
        return <ActionPlansView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'riwayat':
        return <HistoryView />;
      case 'laporan':
        return <ReportsView />;
      case 'pengaturan':
        return <SettingsView />;
      case 'bantuan':
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />

        {/* View Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating System Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
