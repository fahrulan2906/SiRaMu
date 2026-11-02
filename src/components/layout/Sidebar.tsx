import React from 'react';
import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  BookOpenCheck,
  FileSearch,
  Network,
  CalendarClock,
  CheckSquare,
  History,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeTab, setActiveTab, demoMode, schools, actionPlans } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'sekolah',
      label: 'Data Sekolah Binaan',
      icon: Building2,
      badge: `${schools.filter((s) => !s.isDemo).length}`,
    },
    { id: 'unggah', label: 'Unggah Rapor', icon: UploadCloud },
    { id: 'indikator', label: 'Data & Indikator', icon: BookOpenCheck },
    { id: 'analisis-sekolah', label: 'Analisis Per Sekolah', icon: FileSearch },
    { id: 'analisis-lintas', label: 'Analisis Lintas Sekolah', icon: Network },
    {
      id: 'rencana-pendampingan',
      label: 'Rencana Pendampingan',
      icon: CalendarClock,
      badge: `${actionPlans.filter((p) => p.status === 'Sedang dilaksanakan' || p.status === 'Direncanakan').length}`,
    },
    { id: 'monitoring', label: 'Monitoring Tindak Lanjut', icon: CheckSquare },
    { id: 'riwayat', label: 'Riwayat Analisis', icon: History },
    { id: 'laporan', label: 'Generator Laporan', icon: FileText },
    { id: 'pengaturan', label: 'Pengaturan & Profil', icon: Settings },
    { id: 'bantuan', label: 'Bantuan & Panduan', icon: HelpCircle },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-900/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="leading-tight truncate">
                <span className="text-[13px] font-extrabold tracking-wide uppercase text-white block">
                  SI-ANALISIS RAPOR
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 block tracking-wider">
                  KOTA PONTIANAK
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Disdikbud Kota Pontianak
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Demo Indicator Notice in Sidebar */}
        {demoMode && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold block text-[11px]">MODE DEMONSTRASI</span>
              <span className="text-[10px] text-amber-200/80">Data contoh fiktif aktif</span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="hidden group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-slate-700 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          {!collapsed ? (
            <div className="text-xs text-slate-400 text-center leading-relaxed">
              <p className="font-semibold text-slate-300">Pengawas Sekolah Binaan</p>
              <p className="text-[11px] text-emerald-400 font-medium">12 SD • 5 TK Pontianak</p>
              <p className="text-[10px] text-slate-500 mt-1">Zona Waktu: Asia/Pontianak</p>
            </div>
          ) : (
            <div className="flex justify-center text-xs text-emerald-400 font-bold">PTK</div>
          )}
        </div>
      </aside>
    </>
  );
};
