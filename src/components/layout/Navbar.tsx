import React from 'react';
import {
  Menu,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile }) => {
  const {
    supervisorProfile,
    selectedJenjangFilter,
    setSelectedJenjangFilter,
    demoMode,
    setDemoMode,
    deleteDemoData,
    schools,
  } = useApp();

  const sdCount = schools.filter((s) => s.jenjang === 'SD' && (!s.isDemo || demoMode)).length;
  const tkCount = schools.filter((s) => s.jenjang === 'TK' && (!s.isDemo || demoMode)).length;
  const totalCount = sdCount + tkCount;

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${today.getFullYear()}`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#0F2A4A] tracking-tight">
                SI-ANALISIS RAPOR PENDIDIKAN PONTIANAK
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                Disdikbud Kota Pontianak
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Sistem Analisis Rapor Pendidikan dan Pendampingan Satuan Pendidikan Binaan
            </p>
          </div>
        </div>

        {/* Center/Right: Level Filter Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Jenjang Filter Buttons */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedJenjangFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedJenjangFilter === 'ALL'
                  ? 'bg-white text-blue-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setSelectedJenjangFilter('SD')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                selectedJenjangFilter === 'SD'
                  ? 'bg-blue-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              12 SD ({sdCount})
            </button>
            <button
              onClick={() => setSelectedJenjangFilter('TK')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                selectedJenjangFilter === 'TK'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              5 TK ({tkCount})
            </button>
          </div>

          {/* Demo Mode Controller */}
          {demoMode ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1.5 rounded-xl text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold hidden lg:inline">Data Demo Aktif</span>
              <button
                onClick={deleteDemoData}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-950 underline ml-1 cursor-pointer"
                title="Hapus data contoh simulasi"
              >
                Hapus Demo
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDemoMode(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 hover:border-slate-400 px-2.5 py-1.5 rounded-xl transition-colors"
              title="Aktifkan contoh data untuk simulasi pengujian"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Muat Data Demo
            </button>
          )}

          {/* Date & Supervisor Badge */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-mono">{formattedDate} (WIB)</span>
          </div>

          {/* Supervisor Identity */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 pl-2 pr-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                {supervisorProfile.nama.split(',')[0]}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Pengawas Sekolah</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
