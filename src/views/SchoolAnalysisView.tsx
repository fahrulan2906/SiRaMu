import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  MessageSquare,
  PlusCircle,
  HelpCircle,
  RefreshCw,
  Award,
  ChevronDown,
  Edit3,
  Check,
  FileSpreadsheet,
  Activity,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateSchoolSummary } from '../utils/analysisEngine';
import { runComprehensiveAudit, FullAuditReport } from '../utils/auditTests';
import { School, AnalysisRecord, AICoachingRecommendation, AIFinding, AIRootCause } from '../types';

export const SchoolAnalysisView: React.FC = () => {
  const {
    schools,
    raporRecords,
    analysisRecords,
    selectedSchoolId,
    setSelectedSchoolId,
    runSchoolAnalysis,
    updateAnalysisValidation,
    updateAnalysisRecord,
    updateRecommendationStatus,
    createPlanFromRecommendation,
    isLoadingAI,
    demoMode,
  } = useApp();

  const selectableSchools = schools.filter((s) => demoMode || !s.isDemo);

  const activeSchool =
    selectableSchools.find((s) => s.id === selectedSchoolId) || selectableSchools[0];

  const availableYears = Array.from(
    new Set(raporRecords.filter((r) => r.schoolId === activeSchool?.id).map((r) => r.tahun))
  ).sort((a, b) => b - a);

  const [selectedTahun, setSelectedTahun] = useState<number>(availableYears[0] || 2024);
  const [targetDateForPlan, setTargetDateForPlan] = useState<string>('15-03-2026');
  const [activePlanRec, setActivePlanRec] = useState<AICoachingRecommendation | null>(null);

  // Audit Modal State
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<FullAuditReport | null>(null);

  // Edit Analysis Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    ringkasan_eksekutif: '',
    kesimpulan: '',
    catatanPengawas: '',
  });

  // Deterministic summary calculation
  const summary = activeSchool
    ? calculateSchoolSummary(raporRecords, activeSchool, selectedTahun)
    : null;

  // Stored analysis record for active school & tahun
  const currentAnalysis = analysisRecords.find(
    (a) => a.schoolId === activeSchool?.id && a.tahun === selectedTahun
  );

  const handleRunAnalysis = async () => {
    if (!activeSchool) return;
    await runSchoolAnalysis(activeSchool.id, selectedTahun);
  };

  const handleRunAudit = () => {
    const report = runComprehensiveAudit();
    setAuditReport(report);
    setAuditModalOpen(true);
  };

  const handleValidateAnalysis = (status: AnalysisRecord['statusValidasiPengawas']) => {
    if (!currentAnalysis) return;
    updateAnalysisValidation(currentAnalysis.id, status);
  };

  const handleRecStatusChange = (
    rec: AICoachingRecommendation,
    newStatus: 'Disetujui' | 'Ditolak' | 'Perlu validasi pengawas'
  ) => {
    if (!currentAnalysis) return;
    updateRecommendationStatus(currentAnalysis.id, rec.id || '0', newStatus);
  };

  const handleOpenPlanModal = (rec: AICoachingRecommendation) => {
    setActivePlanRec(rec);
  };

  const handleConfirmCreatePlan = () => {
    if (!activeSchool || !activePlanRec) return;
    createPlanFromRecommendation(activeSchool, selectedTahun, activePlanRec, targetDateForPlan);
    setActivePlanRec(null);
  };

  const handleOpenEditAnalysis = () => {
    if (!currentAnalysis) return;
    setEditFormData({
      ringkasan_eksekutif: currentAnalysis.hasilAI.ringkasan_eksekutif || '',
      kesimpulan: currentAnalysis.hasilAI.kesimpulan || '',
      catatanPengawas: currentAnalysis.catatanPengawas || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEditAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnalysis) return;

    updateAnalysisRecord(currentAnalysis.id, {
      catatanPengawas: editFormData.catatanPengawas,
      hasilAI: {
        ...currentAnalysis.hasilAI,
        ringkasan_eksekutif: editFormData.ringkasan_eksekutif,
        kesimpulan: editFormData.kesimpulan,
      },
    });
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* School & Period Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-blue-600" />
              Analisis Rapor Pendidikan Satuan Pendidikan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pemeriksaan capaian numerik deterministik, audit logika non-asumsi, dan sintesis rekomendasi berbantuan Gemini AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audit Engine Trigger */}
          <button
            onClick={handleRunAudit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
            title="Lakukan audit pengujian mesin analisis deterministik & integritas data demonstrasi"
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            Audit Mesin Analisis
          </button>

          {/* School Selector */}
          <select
            value={activeSchool?.id || ''}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-blue-600 max-w-xs"
          >
            {selectableSchools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                [{sch.jenjang}] {sch.nama}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            className="text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-blue-600"
          >
            {availableYears.length > 0 ? (
              availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))
            ) : (
              <option value={2024}>Tahun 2024 (Belum ada data)</option>
            )}
          </select>

          {/* Trigger Analysis Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={isLoadingAI || !summary || summary.totalIndikator === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-700/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoadingAI ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                {currentAnalysis ? 'Analisis Ulang Rapor' : 'Mulai Analisis Rapor'}
              </>
            )}
          </button>
        </div>
      </div>

      {activeSchool && (
        <>
          {/* Active School Identity Strip */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span
                className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${
                  activeSchool.jenjang === 'SD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                Jenjang {activeSchool.jenjang}
              </span>
              <div>
                <p className="font-extrabold text-sm">{activeSchool.nama}</p>
                <p className="text-slate-400 text-[11px]">
                  NPSN: <span className="font-mono">{activeSchool.npsn}</span> • Kecamatan: {activeSchool.kecamatan}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300 text-right">
              <div>
                <p className="text-slate-400 text-[10px]">Kepala Sekolah</p>
                <p className="font-bold text-white">{activeSchool.kepalaSekolah}</p>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <p className="text-slate-400 text-[10px]">Status Validasi Pengawas</p>
                <p
                  className={`font-bold ${
                    currentAnalysis?.statusValidasiPengawas === 'Divalidasi Lengkap'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentAnalysis?.statusValidasiPengawas || 'Belum Dianalisis'}
                </p>
              </div>
            </div>
          </div>

          {/* Section A: Deterministic Calculation Engine Results */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0F2A4A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Perhitungan Data Deterministik & Evaluasi Perkembangan
                </h3>
                <p className="text-xs text-slate-500">
                  Seluruh angka dihitung menggunakan logika kode aplikasi yang dapat diuji dan diverifikasi.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Tahun Data: {selectedTahun}
              </span>
            </div>

            {summary && summary.totalIndikator > 0 ? (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-500 block">Indikator Terdata</span>
                    <span className="text-2xl font-black text-slate-800">{summary.totalIndikator}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="text-[11px] font-bold text-emerald-700 block flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Membaik
                    </span>
                    <span className="text-2xl font-black text-emerald-700">{summary.membaik}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                    <span className="text-[11px] font-bold text-rose-700 block flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Menurun
                    </span>
                    <span className="text-2xl font-black text-rose-700">{summary.menurun}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Tidak Berubah</span>
                    <span className="text-2xl font-black text-slate-700">{summary.tetap}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                    <span className="text-[11px] font-bold text-blue-900 block">Prioritas Perbaikan</span>
                    <span className="text-2xl font-black text-blue-900">
                      {summary.indikatorPrioritas.length}
                    </span>
                  </div>
                </div>

                {/* Optional Internal Priority Score with transparent formula */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block text-sm">
                      Skor Prioritas Internal Pengawas: {summary.skorPrioritasInternal} / 100
                    </span>
                    <p className="text-[11px] text-blue-800/80 mt-0.5">
                      <strong>Dasar Rumus Terbuka:</strong> (100 - Rerata Capaian) &times; 40% + (Rasio Indikator Menurun) &times; 40% + (Rasio Indikator Kritis) &times; 20%.
                      <span className="font-bold text-rose-700 ml-1">Bukan skor resmi Rapor Pendidikan Kemendikbudristek.</span>
                    </p>
                  </div>
                  <span className="shrink-0 px-3 py-1 bg-white text-blue-800 font-bold rounded-lg border border-blue-200 text-xs">
                    Tingkat Urgensi:{' '}
                    {summary.skorPrioritasInternal > 50
                      ? 'Tinggi (Intervensi Cepat)'
                      : summary.skorPrioritasInternal > 25
                      ? 'Sedang (Pendampingan Rutin)'
                      : 'Rendah (Pemeliharaan Mutu)'}
                  </span>
                </div>

                {/* Detailed Indicators Table for this School */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                    Tabel Verifikasi Capaian Indikator Rapor Pendidikan
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Kode</th>
                          <th className="py-2.5 px-3">Nama Indikator</th>
                          <th className="py-2.5 px-3">Dimensi</th>
                          <th className="py-2.5 px-3 text-center">Capaian {selectedTahun}</th>
                          <th className="py-2.5 px-3 text-center">Kategori Resmi</th>
                          <th className="py-2.5 px-3 text-center">Tahun Lalu</th>
                          <th className="py-2.5 px-3 text-center">Arah Perubahan</th>
                          <th className="py-2.5 px-3 text-center">Status Atensi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {raporRecords
                          .filter((r) => r.schoolId === activeSchool.id && r.tahun === selectedTahun)
                          .map((rec) => {
                            const isPrio = summary.indikatorPrioritas.some((p) => p.id === rec.id);
                            return (
                              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-3 font-mono font-bold text-blue-900">
                                  {rec.kodeIndikator}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  {rec.namaIndikator}
                                </td>
                                <td className="py-2 px-3 text-slate-500">{rec.dimensi}</td>
                                <td className="py-2 px-3 text-center font-bold text-blue-900">
                                  {rec.nilaiCapaian ?? '-'}
                                </td>
                                <td className="py-2 px-3 text-center font-medium">
                                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px]">
                                    {rec.kategoriCapaian || '-'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-slate-600">
                                  {rec.nilaiTahunLalu ?? '-'}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                                      rec.arahPerubahan === 'MEMBAIK'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : rec.arahPerubahan === 'MENURUN'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {rec.arahPerubahan}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {isPrio ? (
                                    <span className="px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                                      Perlu Atensi
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                      Terkendali
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold">
                  Belum ada data Rapor Pendidikan untuk {activeSchool.nama} pada tahun {selectedTahun}.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Silakan buka menu "Unggah Rapor" untuk mengimpor berkas Excel atau CSV sekolah ini.
                </p>
              </div>
            )}
          </div>

          {/* Section B: Gemini AI Synthesis & Supervisor Verification */}
          {currentAnalysis && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-extrabold text-[#0F2A4A]">
                      Interpretasi & Rekomendasi Pendampingan Berbantuan AI
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Model: <span className="font-mono font-semibold">{currentAnalysis.modelDigunakan}</span> • Waktu
                    Analisis: {new Date(currentAnalysis.waktuAnalisis).toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Supervisor Actions: Edit & Validate */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenEditAnalysis}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Edit narasi ringkasan eksekutif, catatan pengawas, atau kesimpulan"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    Edit Hasil Analisis
                  </button>

                  <span className="text-xs font-bold text-slate-500 ml-1">Validasi:</span>
                  <button
                    onClick={() => handleValidateAnalysis('Divalidasi Lengkap')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setujui Semua
                  </button>
                  <button
                    onClick={() => handleValidateAnalysis('Sebagian Divalidasi')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tandai Sebagian
                  </button>
                </div>
              </div>

              {/* 1. Ringkasan Eksekutif */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ringkasan Eksekutif Kondisi Sekolah:
                  </h4>
                  <button
                    onClick={handleOpenEditAnalysis}
                    className="text-[11px] text-blue-600 hover:underline font-bold"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium text-justify">
                  {currentAnalysis.hasilAI.ringkasan_eksekutif}
                </p>
              </div>

              {/* 2. Kekuatan Sekolah */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Kekuatan & Praktik Baik Satuan Pendidikan:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentAnalysis.hasilAI.kekuatan_sekolah.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Temuan Utama (Lengkap dengan Indikator, Nilai Asli, Tahun Data, Sumber, dan Dasar Interpretasi) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Temuan Masalah Prioritas (Dilengkapi Indikator, Nilai Asli, Tahun, dan Sumber):
                </h4>
                <div className="space-y-3">
                  {currentAnalysis.hasilAI.temuan_utama.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-sm">
                            {item.kode_indikator}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{item.nama_indikator}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit ${
                            item.tingkat_prioritas === 'Tinggi'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Prioritas {item.tingkat_prioritas}
                        </span>
                      </div>

                      {/* Detail Audit Bar: Nilai Asli, Tahun Data, Dokumen Sumber, Status Bukti */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Nilai Asli:</span>
                          <span className="font-bold text-slate-800">{item.nilai_asli || item.fakta_data.split(' ')[2] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Tahun Data:</span>
                          <span className="font-mono text-slate-800">{item.tahun_data || selectedTahun}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Sumber:</span>
                          <span className="text-slate-800 truncate block">{item.dokumen_sumber || currentAnalysis.dokumenSumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Bukti:</span>
                          <span className="font-semibold text-emerald-800">{item.status_bukti || 'Fakta Rapor'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 block">Fakta Data:</span>
                          <span className="text-slate-800">{item.fakta_data}</span>
                        </div>
                        <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-100">
                          <span className="text-[10px] font-bold text-blue-900 block">Interpretasi & Dasar:</span>
                          <span className="text-slate-800">{item.interpretasi}</span>
                          {item.dasar_interpretasi && (
                            <span className="text-[10px] text-blue-700 block mt-1">
                              Dasar: {item.dasar_interpretasi}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span>
                          <strong>Alasan Prioritas:</strong> {item.alasan_prioritas}
                        </span>
                        <span className="italic text-slate-400">
                          Keterbatasan: {item.keterbatasan_analisis}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Hipotesis Akar Masalah (Tegas Memuat Bukti Diperlukan & Metode Verifikasi) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Hipotesis Dugaan Akar Masalah (Wajib Diverifikasi dengan Bukti Lapangan):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentAnalysis.hasilAI.hipotesis_akar_masalah.map((hip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 leading-snug">{hip.dugaan_masalah}</span>
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-sm font-bold shrink-0">
                          HIPOTESIS
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong>Dasar Dugaan:</strong> {hip.dasar_dugaan}
                      </p>
                      <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium space-y-1">
                        <p>
                          <strong>Bukti Diperlukan:</strong> {hip.bukti_yang_diperlukan}
                        </p>
                        <p>
                          <strong>Metode Verifikasi Pengawas:</strong> {hip.metode_verifikasi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Rekomendasi Pendampingan dengan Validasi Pengawas & Satu-Klik Jadi Rencana */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Rekomendasi Pendampingan Nyata:
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Setujui atau tolak setiap item sebelum dijadikan rencana kerja.
                  </span>
                </div>

                <div className="space-y-4">
                  {currentAnalysis.hasilAI.rekomendasi_pendampingan.map((rec, idx) => {
                    const isApproved = rec.status_rekomendasi === 'Disetujui';
                    const isRejected = rec.status_rekomendasi === 'Ditolak';

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isApproved
                            ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                            : isRejected
                            ? 'border-slate-200 bg-slate-50 opacity-60'
                            : 'border-slate-200 bg-white hover:border-blue-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                              {rec.indikator_terkait}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-1">
                              {rec.tujuan_perbaikan}
                            </h5>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.status_rekomendasi}
                            </span>

                            {/* Decision Buttons */}
                            <button
                              onClick={() => handleRecStatusChange(rec, 'Disetujui')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                              title="Setujui Rekomendasi"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleRecStatusChange(rec, 'Ditolak')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                              title="Tolak Rekomendasi"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="mt-3 space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">
                              Langkah Pendampingan Konkret:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                              {rec.langkah_pendampingan.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div>
                              <span className="font-bold block text-slate-700">Pihak Terlibat:</span>
                              <span>{rec.pihak_terlibat.join(', ')}</span>
                            </div>
                            <div>
                              <span className="font-bold block text-slate-700">Indikator Sukses:</span>
                              <span>{rec.indikator_keberhasilan}</span>
                            </div>
                            <div>
                              <span className="font-bold block text-slate-700">Jangka Waktu:</span>
                              <span className="font-semibold text-blue-800">{rec.jangka_waktu}</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Plan Transformation Button */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end">
                          <button
                            onClick={() => handleOpenPlanModal(rec)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Jadikan Rencana Pendampingan Nyata
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kesimpulan & Catatan Pengawas */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#0F2A4A] text-white space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Kesimpulan Akhir & Catatan Validasi Pengawas:
                  </h4>
                  <button
                    onClick={handleOpenEditAnalysis}
                    className="text-[11px] text-emerald-300 hover:underline font-bold"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed text-justify">
                  {currentAnalysis.hasilAI.kesimpulan}
                </p>
                {currentAnalysis.catatanPengawas && (
                  <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-emerald-200">
                    <strong>Catatan Khusus Pengawas:</strong> {currentAnalysis.catatanPengawas}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: AUDIT MESIN ANALISIS */}
      {auditModalOpen && auditReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#0F2A4A] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Laporan Hasil Audit Mesin Analisis Deterministik
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifikasi kepatuhan metodologis, delta arah ideal, isolasi SD/TK, dan integritas data fiktif.
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  auditReport.overallStatus === 'LULUS_AUDIT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {auditReport.passedCount}/{auditReport.totalTests} LULUS AUDIT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {auditReport.results.map((res) => (
                <div
                  key={res.id}
                  className={`p-3.5 rounded-xl border ${
                    res.passed ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{res.id} • {res.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {res.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{res.name}</h4>
                  <p className="text-slate-600 mt-0.5">{res.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 font-mono text-[11px] text-slate-700">
                    <p><strong>Hasil Uji:</strong> {res.actualOutput}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Tutup Hasil Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT HASIL ANALISIS & REKOMENDASI PENGUJI */}
      {editModalOpen && currentAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in">
            <h3 className="text-lg font-bold text-[#0F2A4A] mb-1">
              Edit & Sahkan Hasil Analisis Pengawas
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pengawas berwenang menyesuaikan narasi ringkasan eksekutif dan kesimpulan sebelum disahkan pada laporan resmi.
            </p>

            <form onSubmit={handleSaveEditAnalysis} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ringkasan Eksekutif Kondisi Satuan Pendidikan
                </label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.ringkasan_eksekutif}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, ringkasan_eksekutif: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kesimpulan Akhir Analisis
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.kesimpulan}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, kesimpulan: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Khusus Pengawas Sekolah (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan hasil supervisi langsung atau kesepakatan tindak lanjut dengan kepala sekolah..."
                  value={editFormData.catatanPengawas}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, catatanPengawas: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI REKOMENDASI JADI RENCANA KERJA */}
      {activePlanRec && activeSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-[#0F2A4A]">
              Transformasi Rekomendasi Menjadi Rencana Pendampingan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan target tanggal dan sasaran kegiatan pendampingan pengawas untuk{' '}
              <strong>{activeSchool.nama}</strong>.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 block">Indikator Prioritas:</span>
                <span className="text-slate-800">{activePlanRec.indikator_terkait}</span>
                <span className="font-bold text-blue-900 block mt-2">Tujuan:</span>
                <span className="text-slate-800">{activePlanRec.tujuan_perbaikan}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jadwal Target Pelaksanaan (DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  value={targetDateForPlan}
                  onChange={(e) => setTargetDateForPlan(e.target.value)}
                  placeholder="Contoh: 15-03-2026"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActivePlanRec(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCreatePlan}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20"
              >
                Simpan ke Jadwal Pendampingan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
