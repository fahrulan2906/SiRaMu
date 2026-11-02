import React, { useState } from 'react';
import {
  Building,
  GraduationCap,
  Baby,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileText,
  CalendarCheck,
  UploadCloud,
  FileSearch,
  PlusCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Info,
  Layers,
  Activity,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateSchoolSummary } from '../utils/analysisEngine';
import { School, Jenjang } from '../types';

export const DashboardView: React.FC = () => {
  const {
    schools,
    raporRecords,
    analysisRecords,
    actionPlans,
    setActiveTab,
    setSelectedSchoolId,
    selectedJenjangFilter,
    setSelectedJenjangFilter,
    demoMode,
  } = useApp();

  const [filterTahun, setFilterTahun] = useState<number | 'ALL'>('ALL');
  const [filterStatusAnalisis, setFilterStatusAnalisis] = useState<string>('ALL');

  // Filter schools based on global & local filters
  const displayedSchools = schools.filter((s) => {
    if (!demoMode && s.isDemo) return false;
    if (selectedJenjangFilter !== 'ALL' && s.jenjang !== selectedJenjangFilter) return false;
    return true;
  });

  // Available Years
  const availableYears = Array.from(new Set(raporRecords.map((r) => r.tahun))).sort((a, b) => b - a);
  const activeYear = filterTahun === 'ALL' ? (availableYears[0] || 2024) : filterTahun;

  // Actual Real-Time Statistics Computation
  const totalBinaan = displayedSchools.length;
  const totalSD = displayedSchools.filter((s) => s.jenjang === 'SD').length;
  const totalTK = displayedSchools.filter((s) => s.jenjang === 'TK').length;

  // Schools with Rapor Records
  const schoolsWithData = displayedSchools.filter((s) =>
    raporRecords.some((r) => r.schoolId === s.id && (filterTahun === 'ALL' || r.tahun === filterTahun))
  );
  const totalWithData = schoolsWithData.length;
  const totalWithoutData = totalBinaan - totalWithData;

  // Analyzed Schools
  const analyzedSchools = displayedSchools.filter((s) =>
    analysisRecords.some((a) => a.schoolId === s.id && (filterTahun === 'ALL' || a.tahun === filterTahun))
  );
  const totalAnalyzed = analyzedSchools.length;
  const totalNeedAnalysis = totalWithData - totalAnalyzed;

  // Priority Indicators Identified across all displayed schools
  const allCurrentRecords = raporRecords.filter(
    (r) =>
      displayedSchools.some((s) => s.id === r.schoolId) &&
      (filterTahun === 'ALL' || r.tahun === filterTahun)
  );

  const priorityIndicatorsCount = allCurrentRecords.filter((r) => {
    const kat = (r.kategoriCapaian || '').toLowerCase();
    return (
      r.arahPerubahan === 'MENURUN' ||
      kat.includes('kurang') ||
      kat.includes('perlu') ||
      kat.includes('dasar')
    );
  }).length;

  // Action Plans
  const displayedActionPlans = actionPlans.filter(
    (p) => displayedSchools.some((s) => s.id === p.schoolId) && (filterTahun === 'ALL' || p.tahun === filterTahun)
  );
  const totalActionPlans = displayedActionPlans.length;
  const completedActionPlans = displayedActionPlans.filter((p) => p.status === 'Selesai').length;

  // Schools Needing Attention (have decreasing indicators or priority issues)
  const schoolsNeedingAttention = displayedSchools
    .map((school) => {
      const summary = calculateSchoolSummary(raporRecords, school, activeYear);
      return {
        school,
        summary,
        hasData: summary.totalIndikator > 0,
      };
    })
    .filter((item) => item.hasData && (item.summary.menurun > 0 || item.summary.indikatorPrioritas.length > 0))
    .sort((a, b) => b.summary.indikatorPrioritas.length - a.summary.indikatorPrioritas.length);

  // Incomplete Data Schools
  const schoolsIncomplete = displayedSchools.filter((s) => {
    const recs = raporRecords.filter((r) => r.schoolId === s.id && r.tahun === activeYear);
    return recs.length === 0;
  });

  // Pending Recommendations
  const pendingRecommendations = analysisRecords
    .filter((a) => displayedSchools.some((s) => s.id === a.schoolId))
    .flatMap((a) =>
      a.hasilAI.rekomendasi_pendampingan
        .filter((r) => r.status_rekomendasi === 'Perlu validasi pengawas')
        .map((r) => ({
          analysisId: a.id,
          schoolId: a.schoolId,
          namaSekolah: a.namaSekolah,
          jenjang: a.jenjang,
          tahun: a.tahun,
          recommendation: r,
        }))
    );

  const handleOpenSchoolAnalysis = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setActiveTab('analisis-sekolah');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] via-[#163a66] to-[#0c4a6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Pusat Kendali Pengawasan Satuan Pendidikan
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Dashboard Analisis Rapor Pendidikan Pontianak
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Selamat datang di sistem pendampingan berbasis data. Pantau capaian, identifikasi indikator
              prioritas, dan susun intervensi nyata bagi 17 satuan pendidikan binaan (12 SD & 5 TK).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('unggah')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Unggah Rapor
            </button>
            <button
              onClick={() => setActiveTab('analisis-sekolah')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-700/30 transition-all cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              Analisis Sekolah
            </button>
            <button
              onClick={() => setActiveTab('laporan')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Lihat Laporan
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter Dashboard:
          </span>

          {/* Jenjang Filter */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedJenjangFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedJenjangFilter === 'ALL' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Semua Satuan
            </button>
            <button
              onClick={() => setSelectedJenjangFilter('SD')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedJenjangFilter === 'SD' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              12 SD
            </button>
            <button
              onClick={() => setSelectedJenjangFilter('TK')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                selectedJenjangFilter === 'TK' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              5 TK
            </button>
          </div>

          {/* Tahun Filter */}
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-blue-500"
          >
            <option value="ALL">Semua Periode Data</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun Rapor {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan data aktual berdasarkan dokumen tersimpan di aplikasi
        </div>
      </div>

      {/* 10 Required Statistics Cards (Mandat Bagian 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Sekolah Binaan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sekolah Binaan
            </span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0F2A4A]">{totalBinaan}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total Satuan Binaan</p>
        </div>

        {/* 2. Jumlah SD */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sekolah Dasar
            </span>
            <GraduationCap className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-blue-700">{totalSD}</div>
          <p className="text-[11px] text-slate-500 mt-1">12 SD Wilayah Binaan</p>
        </div>

        {/* 3. Jumlah TK */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Taman Kanak-Kanak
            </span>
            <Baby className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalTK}</div>
          <p className="text-[11px] text-slate-500 mt-1">5 TK / Satuan PAUD</p>
        </div>

        {/* 4. Memiliki Data Rapor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ada Data Rapor
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalWithData}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalBinaan > 0 ? `${Math.round((totalWithData / totalBinaan) * 100)}% dari target` : '-'}
          </p>
        </div>

        {/* 5. Belum Unggah Data */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Belum Ada Data
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{totalWithoutData}</div>
          <p className="text-[11px] text-slate-500 mt-1">Perlu unggah dokumen</p>
        </div>

        {/* 6. Sudah Dianalisis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sudah Dianalisis
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{totalAnalyzed}</div>
          <p className="text-[11px] text-slate-500 mt-1">Analisis rapor selesai</p>
        </div>

        {/* 7. Butuh Analisis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Butuh Analisis
            </span>
            <FileSearch className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{totalNeedAnalysis}</div>
          <p className="text-[11px] text-slate-500 mt-1">Ada data, belum dianalisis</p>
        </div>

        {/* 8. Indikator Prioritas Perbaikan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Indikator Prioritas
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {totalWithData > 0 ? priorityIndicatorsCount : 'Belum ada data'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Perlu atensi pendampingan</p>
        </div>

        {/* 9. Rencana Tindak Lanjut Dibuat */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rencana Dibuat
            </span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalActionPlans}</div>
          <p className="text-[11px] text-slate-500 mt-1">Program pendampingan</p>
        </div>

        {/* 10. Rencana Tindak Lanjut Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rencana Selesai
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{completedActionPlans}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalActionPlans > 0
              ? `${Math.round((completedActionPlans / totalActionPlans) * 100)}% terevaluasi`
              : 'Belum ada rencana'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Prioritas Atensi & Status Sekolah */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Sekolah yang Perlu Perhatian Pengawas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">
                  Daftar Sekolah yang Memerlukan Perhatian Khusus
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Periode {activeYear}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {schoolsNeedingAttention.length > 0 ? (
                schoolsNeedingAttention.slice(0, 5).map(({ school, summary }) => (
                  <div
                    key={school.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            school.jenjang === 'SD'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {school.jenjang}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {school.nama}
                        </h4>
                        {!school.isVerified && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm">
                            Contoh
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Kecamatan: {school.kecamatan} • Kepala Sekolah: {school.kepalaSekolah}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-sm">
                          <TrendingDown className="w-3 h-3" />
                          {summary.menurun} Indikator Turun
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-sm">
                          {summary.indikatorPrioritas.length} Indikator Prioritas Perbaikan
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSchoolAnalysis(school.id)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Buka Analisis
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-medium">
                    Tidak ada sekolah dengan indikator kemunduran kritis pada data saat ini.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Atau unggah data Rapor Pendidikan untuk sekolah yang belum memiliki catatan.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Sekolah yang Belum Memiliki Data Lengkap */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-sm text-slate-800">
                  Satuan Pendidikan Belum Mengunggah Data ({schoolsIncomplete.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('unggah')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Unggah Sekarang
              </button>
            </div>

            <div className="p-4">
              {schoolsIncomplete.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {schoolsIncomplete.slice(0, 6).map((sch) => (
                    <div
                      key={sch.id}
                      className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{sch.nama}</p>
                        <p className="text-[11px] text-slate-400">NPSN: {sch.npsn} • {sch.jenjang}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSchoolId(sch.id);
                          setActiveTab('unggah');
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
                      >
                        Unggah
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Semua sekolah binaan telah memiliki data Rapor Pendidikan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pending Recommendations & Quick Links */}
        <div className="space-y-6">
          {/* Pending AI Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Rekomendasi Perlu Validasi ({pendingRecommendations.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar">
              {pendingRecommendations.length > 0 ? (
                pendingRecommendations.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-blue-800">{item.namaSekolah}</span>
                      <span>{item.tahun}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                      {item.recommendation.tujuan_perbaikan}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      Indikator: {item.recommendation.indikator_terkait}
                    </p>
                    <button
                      onClick={() => handleOpenSchoolAnalysis(item.schoolId)}
                      className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Verifikasi & Buat Rencana
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <Info className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  Tidak ada rekomendasi yang menunggu validasi pengawas saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0F2A4A] text-white p-5 rounded-xl shadow-md">
            <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-400 mb-2">
              <GraduationCap className="w-4 h-4" />
              Prinsip Pengawasan Berbasis Data
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hasil analisis indikator Rapor Pendidikan berfungsi sebagai bahan refleksi awal bagi pengawas.
              Selalu verifikasi dugaan akar masalah bersama Kepala Sekolah melalui wawancara dan telaah
              bukti fisik sebelum menetapkan status intervensi.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Dinas Pendidikan Kota Pontianak</span>
              <button
                onClick={() => setActiveTab('bantuan')}
                className="text-xs text-emerald-400 font-bold hover:underline"
              >
                Baca Panduan &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
