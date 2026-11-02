import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Building,
  GraduationCap,
  Baby,
  CalendarCheck,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Layers,
  Sparkles,
  Edit3,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportToXLSX,
  exportToCSV,
  exportReportToWord,
  printReportPreview,
} from '../utils/exportHelpers';
import { calculateSchoolSummary } from '../utils/analysisEngine';
import { School, Jenjang } from '../types';

export const ReportsView: React.FC = () => {
  const {
    schools,
    raporRecords,
    analysisRecords,
    actionPlans,
    supervisorProfile,
    demoMode,
  } = useApp();

  // Report Types:
  // A: Individual Sekolah, B: Rekap 12 SD, C: Rekap 5 TK, D: Keseluruhan 17 Sekolah, E: Rencana Tindak Lanjut
  const [reportType, setReportType] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  const selectableSchools = schools.filter((s) => demoMode || !s.isDemo);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    selectableSchools[0]?.id || ''
  );
  const [selectedTahun, setSelectedTahun] = useState<number>(2024);

  // Edit Mode state for modifying narrative before formal authorization
  const [isEditMode, setIsEditMode] = useState(false);
  const [customExecSummary, setCustomExecSummary] = useState('');
  const [customConclusion, setCustomConclusion] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const targetSchool = selectableSchools.find((s) => s.id === selectedSchoolId);

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${today.getFullYear()}`;

  // Filtered action plans
  const targetPlans = actionPlans.filter((p) => {
    if (!demoMode && p.isDemo) return false;
    if (reportType === 'A' && targetSchool) return p.schoolId === targetSchool.id;
    if (reportType === 'B') return p.jenjang === 'SD';
    if (reportType === 'C') return p.jenjang === 'TK';
    return true;
  });

  // Analysis for individual report
  const individualAnalysis = analysisRecords.find(
    (a) => a.schoolId === targetSchool?.id && a.tahun === selectedTahun
  );

  const individualRecords = raporRecords.filter(
    (r) => r.schoolId === targetSchool?.id && r.tahun === selectedTahun
  );

  const individualSummary = targetSchool
    ? calculateSchoolSummary(raporRecords, targetSchool, selectedTahun)
    : null;

  // Active executive summary & conclusion (respecting custom edits if in edit mode)
  const displayExecSummary =
    customExecSummary ||
    individualAnalysis?.hasilAI.ringkasan_eksekutif ||
    (individualRecords.length > 0
      ? `Berdasarkan data Rapor Pendidikan tahun ${selectedTahun}, ${targetSchool?.nama} memiliki ${individualRecords.length} indikator terdata. Terdapat ${individualSummary?.membaik || 0} indikator mengalami peningkatan positif dan ${individualSummary?.menurun || 0} indikator membutuhkan pendampingan terfokus.`
      : 'Data Rapor Pendidikan belum tersedia untuk periode evaluasi ini.');

  const displayConclusion =
    customConclusion ||
    individualAnalysis?.hasilAI.kesimpulan ||
    `Fokus utama pendampingan pengawas bagi ${targetSchool?.nama || 'satuan pendidikan'} tahun ${selectedTahun} diarahkan pada penguatan kompetensi pendidik dan pembenahan indikator prioritas secara berkelanjutan.`;

  const displayNotes =
    customNotes ||
    individualAnalysis?.catatanPengawas ||
    'Seluruh rekomendasi telah diverifikasi dan diselaraskan dengan program kerja pengawasan tahun berjalan.';

  // Handle Export to Word (DOCX / DOC)
  const handleExportWord = () => {
    const reportElem = document.getElementById('report-printable-content');
    if (!reportElem) return;

    let title = 'Laporan Pengawasan Rapor Pendidikan';
    if (reportType === 'A' && targetSchool) {
      title = `Laporan Individual Rapor Pendidikan - ${targetSchool.nama}`;
    } else if (reportType === 'B') {
      title = `Laporan Rekapitulasi 12 SD Binaan Kota Pontianak`;
    } else if (reportType === 'C') {
      title = `Laporan Rekapitulasi 5 TK Binaan Kota Pontianak`;
    } else if (reportType === 'D') {
      title = `Laporan Manajemen Keseluruhan 17 Satuan Pendidikan Binaan`;
    } else if (reportType === 'E') {
      title = `Laporan Rencana Tindak Lanjut Pendampingan`;
    }

    exportReportToWord(title, reportElem.innerHTML, supervisorProfile, title.replace(/[^a-zA-Z0-9]/g, '_'));
  };

  // Handle Export to Excel (XLSX)
  const handleExportExcel = () => {
    if (reportType === 'A' && targetSchool) {
      const rows = individualRecords.map((r) => ({
        Kode: r.kodeIndikator,
        'Nama Indikator': r.namaIndikator,
        Dimensi: r.dimensi,
        'Capaian Terkini': r.nilaiCapaian ?? '-',
        'Kategori Resmi': r.kategoriCapaian || '-',
        'Tahun Lalu': r.nilaiTahunLalu ?? '-',
        'Arah Perubahan': r.arahPerubahan,
        Satuan: r.satuan,
        'Dokumen Sumber': r.dokumenSumber,
      }));
      exportToXLSX(rows, `Rapor_${targetSchool.nama.replace(/\s+/g, '_')}_${selectedTahun}`, 'Rapor_Sekolah');
    } else if (reportType === 'E') {
      const rows = targetPlans.map((p) => ({
        'Satuan Pendidikan': p.namaSekolah,
        Jenjang: p.jenjang,
        'Bentuk Kegiatan': p.bentukKegiatan,
        'Indikator Prioritas': p.indikatorPrioritas,
        Jadwal: p.jadwalPelaksanaan,
        Sasaran: p.sasaran,
        'Penanggung Jawab': p.penanggungJawab,
        Status: p.status,
        'Bukti Dukung': p.buktiDukung,
        'Hasil Evaluasi': p.hasilEvaluasi || 'Belum dievaluasi',
      }));
      exportToXLSX(rows, `Rencana_Pendampingan_Pengawas_Pontianak`, 'Rencana_Supervisi');
    } else {
      // Rekapitulasi Satuan
      const targetJenjang: Jenjang = reportType === 'C' ? 'TK' : 'SD';
      const filtered = schools.filter(
        (s) =>
          (!s.isDemo || demoMode) &&
          (reportType === 'D' ? true : s.jenjang === targetJenjang)
      );

      const rows = filtered.map((s) => {
        const summ = calculateSchoolSummary(raporRecords, s, selectedTahun);
        return {
          NPSN: s.npsn,
          'Nama Satuan Pendidikan': s.nama,
          Jenjang: s.jenjang,
          Kecamatan: s.kecamatan,
          'Kepala Sekolah': s.kepalaSekolah,
          'Total Indikator': summ.totalIndikator,
          Membaik: summ.membaik,
          Menurun: summ.menurun,
          'Indikator Prioritas': summ.indikatorPrioritas.length,
          'Skor Prioritas Internal': summ.skorPrioritasInternal,
        };
      });

      exportToXLSX(rows, `Rekapitulasi_Satuan_Binaan_${reportType}`, 'Rekapitulasi');
    }
  };

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (reportType === 'A' && targetSchool) {
      const rows = individualRecords.map((r) => ({
        Kode: r.kodeIndikator,
        Nama_Indikator: r.namaIndikator,
        Dimensi: r.dimensi,
        Capaian_Terkini: r.nilaiCapaian ?? '',
        Kategori: r.kategoriCapaian || '',
        Tahun_Lalu: r.nilaiTahunLalu ?? '',
        Arah_Perubahan: r.arahPerubahan,
      }));
      exportToCSV(rows, `Data_Rapor_${targetSchool.npsn}_${selectedTahun}`);
    } else {
      handleExportExcel();
    }
  };

  const handlePrint = () => {
    printReportPreview('report-printable-content');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generator Laporan Pengawasan Satuan Pendidikan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cetak dokumen resmi pengawasan berstandar Dinas Pendidikan dan Kebudayaan Kota Pontianak dalam format PDF, Word, Excel, dan CSV.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Edit Mode */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isEditMode
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-inner'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Aktifkan mode edit untuk mengubah narasi sebelum disahkan"
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            {isEditMode ? 'Kunci & Tinjau Laporan' : 'Edit Narasi Laporan'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Unduh Word (.doc)
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Demo Mode Warning Banner */}
      {demoMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Peringatan Integritas Dokumen Resmi:</p>
            <p className="text-amber-800 leading-relaxed">
              Mode data demonstrasi sedang aktif. Dokumen yang dicetak memuat tanda
              <strong> "DATA DEMONSTRASI — BUKAN DOKUMEN RESMI"</strong>. Hapus data demonstrasi melalui menu
              Navbar atau Pengaturan sebelum mencetak laporan kedinasan.
            </p>
          </div>
        </div>
      )}

      {/* Report Configuration Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Report Type Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {[
            { id: 'A', label: 'A. Laporan Individual Sekolah' },
            { id: 'B', label: 'B. Rekapitulasi 12 SD' },
            { id: 'C', label: 'C. Rekapitulasi 5 TK' },
            { id: 'D', label: 'D. Keseluruhan 17 Sekolah' },
            { id: 'E', label: 'E. Rencana Tindak Lanjut' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setReportType(type.id as any);
                setIsEditMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                reportType === type.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Dynamic Selector for Individual School & Year */}
        <div className="flex flex-wrap items-center gap-2">
          {reportType === 'A' && (
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="text-xs font-bold p-2 border border-slate-300 rounded-lg bg-slate-50 max-w-xs"
            >
              {selectableSchools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  [{sch.jenjang}] {sch.nama}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            className="text-xs font-bold p-2 border border-slate-300 rounded-lg bg-slate-50"
          >
            <option value={2026}>Tahun 2026</option>
            <option value={2025}>Tahun 2025</option>
            <option value={2024}>Tahun 2024</option>
            <option value={2023}>Tahun 2023</option>
          </select>
        </div>
      </div>

      {/* Edit Mode Instructions Banner */}
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-700" />
            <span>
              <strong>Mode Edit Aktif:</strong> Anda dapat mengedit langsung teks ringkasan eksekutif, kesimpulan, dan catatan pengawas pada kotak teks di bawah ini.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs"
          >
            Selesai Edit
          </button>
        </div>
      )}

      {/* PREVIEW CONTAINER (Styled Formally for Printing and PDF) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 max-w-4xl mx-auto">
        <div id="report-printable-content" className="space-y-6 text-slate-900 leading-relaxed font-serif">
          {/* KOP RESMI PEMERINTAH KOTA PONTIANAK */}
          <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
            <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-800">
              PEMERINTAH KOTA PONTIANAK
            </h3>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#0F2A4A] mt-0.5">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <p className="text-xs italic text-slate-600 mt-1">
              Sistem Informasi Analisis Rapor Pendidikan dan Pendampingan Satuan Pendidikan Binaan
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. Letnan Jenderal Sutoyo No. 1, Kota Pontianak, Kalimantan Barat • Kode Pos 78121
            </p>
          </div>

          {/* REPORT HEADER */}
          <div className="text-center space-y-1">
            <h1 className="text-lg font-black uppercase text-[#0F2A4A] tracking-tight">
              {reportType === 'A' && `LAPORAN HASIL ANALISIS RAPOR PENDIDIKAN DAN REKOMENDASI PENDAMPINGAN`}
              {reportType === 'B' && `LAPORAN REKAPITULASI CAPAIAN 12 SEKOLAH DASAR (SD) BINAAN`}
              {reportType === 'C' && `LAPORAN REKAPITULASI CAPAIAN 5 TAMAN KANAK-KANAK (TK) BINAAN`}
              {reportType === 'D' && `LAPORAN MANAJEMEN KESELURUHAN 17 SATUAN PENDIDIKAN BINAAN`}
              {reportType === 'E' && `LAPORAN RENCANA TINDAK LANJUT DAN MONITORING PENDAMPINGAN`}
            </h1>
            <p className="text-xs font-sans text-slate-500">
              Tahun Evaluasi: {selectedTahun} | Dokumen Diterbitkan: {dateStr}
            </p>
            {demoMode && (
              <p className="text-xs font-sans font-bold text-amber-700 bg-amber-50 border border-amber-200 py-1 px-3 rounded-md inline-block">
                DATA DEMONSTRASI — BUKAN DOKUMEN RESMI
              </p>
            )}
          </div>

          {/* CONTENT TYPE A: INDIVIDUAL SEKOLAH */}
          {reportType === 'A' && targetSchool && (
            <div className="space-y-6 text-xs font-sans">
              {/* Identitas Satuan Pendidikan */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Nama Satuan Pendidikan:</span>
                  <span className="font-bold text-slate-900 text-sm">{targetSchool.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NPSN / Status Akreditasi:</span>
                  <span className="font-mono font-bold text-slate-900">{targetSchool.npsn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jenjang / Kecamatan:</span>
                  <span className="font-bold text-slate-900">{targetSchool.jenjang} • {targetSchool.kecamatan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kepala Sekolah:</span>
                  <span className="font-bold text-slate-900">{targetSchool.kepalaSekolah}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dokumen Sumber:</span>
                  <span className="font-mono text-slate-700">{individualRecords[0]?.dokumenSumber || 'Rapor Pendidikan Terverifikasi'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Validasi Pengawas:</span>
                  <span className="font-bold text-emerald-800">{individualAnalysis?.statusValidasiPengawas || 'Divalidasi Lengkap'}</span>
                </div>
              </div>

              {/* I. Ringkasan Eksekutif */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                  I. Ringkasan Eksekutif Kondisi Sekolah
                </h4>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={displayExecSummary}
                    onChange={(e) => setCustomExecSummary(e.target.value)}
                    className="w-full p-2.5 border border-blue-400 rounded-lg text-xs font-sans bg-blue-50/20"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed text-justify">
                    {displayExecSummary}
                  </p>
                )}
              </div>

              {/* II. Gambaran Data yang Tersedia */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                  II. Gambaran Data & Rekapitulasi Capaian Numerik
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  <div className="p-2 border border-slate-300 rounded bg-slate-50">
                    <span className="text-slate-500 block text-[10px]">Total Indikator</span>
                    <span className="font-bold text-sm">{individualSummary?.totalIndikator || individualRecords.length}</span>
                  </div>
                  <div className="p-2 border border-emerald-300 rounded bg-emerald-50">
                    <span className="text-emerald-700 block text-[10px]">Membaik</span>
                    <span className="font-bold text-sm text-emerald-800">+{individualSummary?.membaik || 0}</span>
                  </div>
                  <div className="p-2 border border-rose-300 rounded bg-rose-50">
                    <span className="text-rose-700 block text-[10px]">Menurun</span>
                    <span className="font-bold text-sm text-rose-800">-{individualSummary?.menurun || 0}</span>
                  </div>
                  <div className="p-2 border border-blue-300 rounded bg-blue-50">
                    <span className="text-blue-700 block text-[10px]">Prioritas Perbaikan</span>
                    <span className="font-bold text-sm text-blue-900">{individualSummary?.indikatorPrioritas.length || 0}</span>
                  </div>
                </div>

                {/* Tabel Capaian Indikator */}
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="border p-2">Kode</th>
                      <th className="border p-2">Nama Indikator</th>
                      <th className="border p-2">Dimensi</th>
                      <th className="border p-2 text-center">Capaian {selectedTahun}</th>
                      <th className="border p-2 text-center">Kategori Resmi</th>
                      <th className="border p-2 text-center">Tahun Lalu</th>
                      <th className="border p-2 text-center">Perubahan</th>
                      <th className="border p-2 text-center">Arah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="border p-2 font-mono font-bold">{r.kodeIndikator}</td>
                        <td className="border p-2 font-medium">{r.namaIndikator}</td>
                        <td className="border p-2 text-slate-500">{r.dimensi}</td>
                        <td className="border p-2 text-center font-bold text-blue-900">{r.nilaiCapaian ?? '-'}</td>
                        <td className="border p-2 text-center">{r.kategoriCapaian || '-'}</td>
                        <td className="border p-2 text-center font-mono">{r.nilaiTahunLalu ?? '-'}</td>
                        <td className="border p-2 text-center font-bold">
                          {r.perubahan !== null ? (r.perubahan > 0 ? `+${r.perubahan}` : r.perubahan) : '-'}
                        </td>
                        <td className="border p-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.arahPerubahan === 'MEMBAIK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.arahPerubahan === 'MENURUN'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.arahPerubahan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* III. Kekuatan Satuan Pendidikan */}
              {individualAnalysis?.hasilAI.kekuatan_sekolah && individualAnalysis.hasilAI.kekuatan_sekolah.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                    III. Kekuatan & Praktik Baik Satuan Pendidikan
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {individualAnalysis.hasilAI.kekuatan_sekolah.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* IV. Masalah Prioritas & Hipotesis Akar Masalah */}
              {individualAnalysis?.hasilAI.temuan_utama && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                    IV. Temuan Masalah Prioritas & Hipotesis Akar Masalah
                  </h4>
                  <div className="space-y-3">
                    {individualAnalysis.hasilAI.temuan_utama.map((item, idx) => (
                      <div key={idx} className="p-3 border border-slate-300 rounded-lg bg-slate-50/40 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">
                            {item.kode_indikator} - {item.nama_indikator}
                          </span>
                          <span className="font-bold text-rose-700 text-[10px]">
                            Prioritas: {item.tingkat_prioritas}
                          </span>
                        </div>
                        <p className="text-slate-700"><strong>Fakta Rapor:</strong> {item.fakta_data}</p>
                        <p className="text-slate-700"><strong>Interpretasi:</strong> {item.interpretasi}</p>
                        <p className="text-slate-500 text-[11px]"><strong>Alasan Atensi:</strong> {item.alasan_prioritas}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hipotesis Akar Masalah (Tegas: Butuh Bukti Lapangan) */}
                  <div className="mt-3 p-3 border border-amber-300 rounded-lg bg-amber-50/30 space-y-2">
                    <span className="font-bold text-amber-950 block uppercase text-[11px]">
                      Hipotesis Dugaan Akar Masalah (Wajib Diverifikasi di Lapangan):
                    </span>
                    {individualAnalysis.hasilAI.hipotesis_akar_masalah.map((hip, idx) => (
                      <div key={idx} className="text-[11px] text-slate-700 space-y-0.5 border-b border-amber-200/60 pb-1.5 last:border-b-0">
                        <p className="font-semibold text-slate-900">&bull; {hip.dugaan_masalah}</p>
                        <p className="text-slate-600">Dasar: {hip.dasar_dugaan}</p>
                        <p className="text-amber-900 font-medium">Bukti Diperlukan: {hip.bukti_yang_diperlukan} (Verifikasi: {hip.metode_verifikasi})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* V. Rekomendasi Program Pendampingan Pengawas */}
              {individualAnalysis?.hasilAI.rekomendasi_pendampingan && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                    V. Rekomendasi Program Pendampingan Terverifikasi
                  </h4>
                  <div className="space-y-3">
                    {individualAnalysis.hasilAI.rekomendasi_pendampingan.map((rec, i) => (
                      <div key={i} className="p-3 border border-slate-300 rounded-lg bg-white space-y-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-900">{rec.indikator_terkait}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Status: {rec.status_rekomendasi}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">{rec.tujuan_perbaikan}</p>
                        <p className="text-[11px] text-slate-600">
                          <strong>Langkah Intervensi:</strong> {rec.langkah_pendampingan.join('; ')}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          <strong>Indikator Keberhasilan:</strong> {rec.indikator_keberhasilan} | <strong>Jangka Waktu:</strong> {rec.jangka_waktu}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VI. Rencana Tindak Lanjut Terjadwal */}
              {targetPlans.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                    VI. Matriks Rencana Tindak Lanjut Supervisi Satuan Pendidikan
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="border p-2">Bentuk Kegiatan</th>
                        <th className="border p-2">Fokus Indikator</th>
                        <th className="border p-2 text-center">Jadwal</th>
                        <th className="border p-2">Sasaran</th>
                        <th className="border p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetPlans.map((p) => (
                        <tr key={p.id}>
                          <td className="border p-2 font-medium">{p.bentukKegiatan}</td>
                          <td className="border p-2">{p.indikatorPrioritas}</td>
                          <td className="border p-2 text-center font-mono">{p.jadwalPelaksanaan}</td>
                          <td className="border p-2">{p.sasaran}</td>
                          <td className="border p-2 text-center font-bold">{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VII. Kesimpulan & Catatan Validasi Pengawas */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                  VII. Kesimpulan & Catatan Pengesahan Pengawas Sekolah
                </h4>
                {isEditMode ? (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">Kesimpulan:</label>
                    <textarea
                      rows={3}
                      value={displayConclusion}
                      onChange={(e) => setCustomConclusion(e.target.value)}
                      className="w-full p-2 border border-blue-400 rounded-lg text-xs font-sans"
                    />
                    <label className="block text-[11px] font-bold text-slate-600">Catatan Khusus Pengawas:</label>
                    <textarea
                      rows={2}
                      value={displayNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full p-2 border border-blue-400 rounded-lg text-xs font-sans"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {displayConclusion}
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px]">
                      <strong>Catatan Pengesahan Pengawas:</strong> {displayNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTENT TYPE B / C / D: REKAPITULASI SEKOLAH BINAAN */}
          {(reportType === 'B' || reportType === 'C' || reportType === 'D') && (
            <div className="space-y-6 text-xs font-sans">
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {reportType === 'B' && 'Wilayah Binaan: 12 Sekolah Dasar (SD) Kota Pontianak'}
                  {reportType === 'C' && 'Wilayah Binaan: 5 Taman Kanak-Kanak (TK / PAUD) Kota Pontianak'}
                  {reportType === 'D' && 'Manajemen Seluruh 17 Satuan Pendidikan Binaan (12 SD & 5 TK)'}
                </p>
                <p className="text-slate-600">
                  Pengawas Pembina: <strong>{supervisorProfile.nama}</strong> | NIP. {supervisorProfile.nip}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1 mb-2">
                  Tabel Rekapitulasi Kondisi & Kelengkapan Data Satuan Binaan (Tahun {selectedTahun})
                </h4>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="border p-2 w-8 text-center">No</th>
                      <th className="border p-2">NPSN</th>
                      <th className="border p-2">Nama Satuan Pendidikan</th>
                      <th className="border p-2 text-center">Jenjang</th>
                      <th className="border p-2">Kecamatan</th>
                      <th className="border p-2 text-center">Indikator Terdata</th>
                      <th className="border p-2 text-center">Membaik</th>
                      <th className="border p-2 text-center">Menurun</th>
                      <th className="border p-2 text-center">Prioritas Atensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectableSchools
                      .filter((s) => {
                        if (reportType === 'B') return s.jenjang === 'SD';
                        if (reportType === 'C') return s.jenjang === 'TK';
                        return true;
                      })
                      .map((s, idx) => {
                        const summ = calculateSchoolSummary(raporRecords, s, selectedTahun);
                        return (
                          <tr key={s.id}>
                            <td className="border p-2 text-center font-mono">{idx + 1}</td>
                            <td className="border p-2 font-mono">{s.npsn}</td>
                            <td className="border p-2 font-bold">{s.nama}</td>
                            <td className="border p-2 text-center">{s.jenjang}</td>
                            <td className="border p-2">{s.kecamatan}</td>
                            <td className="border p-2 text-center font-mono">{summ.totalIndikator}</td>
                            <td className="border p-2 text-center font-bold text-emerald-700">{summ.membaik}</td>
                            <td className="border p-2 text-center font-bold text-rose-700">{summ.menurun}</td>
                            <td className="border p-2 text-center font-bold">
                              {summ.indikatorPrioritas.length > 0 ? (
                                <span className="text-rose-700">{summ.indikatorPrioritas.length} Indikator</span>
                              ) : (
                                <span className="text-emerald-700">Stabil</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Tema Bersama Rekomendasi Tingkat Kelompok */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <h5 className="font-bold text-slate-900 uppercase text-xs">
                  Rekomendasi Program Pendampingan Tingkat Kelompok (Gugus / KKG / IGTKI):
                </h5>
                <p className="text-slate-700 leading-relaxed text-justify">
                  Berdasarkan pemetaan lintas satuan binaan, prioritas intervensi bersama tingkat gugus difokuskan pada:
                  (1) Penguatan siklus inkuiri Komunitas Belajar (Kombel) intra-sekolah; (2) Lokakarya penyusunan modul ajar berbasis konteks lokal tepian Sungai Kapuas; serta (3) Pendampingan Perencanaan Berbasis Data (PBD) dalam ARKAS untuk menjamin alokasi anggaran mutu pembelajaran.
                </p>
              </div>
            </div>
          )}

          {/* CONTENT TYPE E: ACTION PLANS REPORT */}
          {reportType === 'E' && (
            <div className="space-y-6 text-xs font-sans">
              <p className="text-slate-700">
                Daftar program pendampingan terjadwal, sasaran kegiatan, penanggung jawab, bukti dukung, dan status evaluasi pengawas:
              </p>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="border p-2">Satuan Pendidikan</th>
                    <th className="border p-2">Bentuk Kegiatan</th>
                    <th className="border p-2">Indikator Prioritas</th>
                    <th className="border p-2 text-center">Jadwal</th>
                    <th className="border p-2">Bukti Dukung</th>
                    <th className="border p-2 text-center">Status</th>
                    <th className="border p-2">Hasil Evaluasi</th>
                  </tr>
                </thead>
                <tbody>
                  {targetPlans.map((p) => (
                    <tr key={p.id}>
                      <td className="border p-2 font-bold">{p.namaSekolah}</td>
                      <td className="border p-2 font-medium">{p.bentukKegiatan}</td>
                      <td className="border p-2">{p.indikatorPrioritas}</td>
                      <td className="border p-2 text-center font-mono">{p.jadwalPelaksanaan}</td>
                      <td className="border p-2 text-slate-600">{p.buktiDukung || '-'}</td>
                      <td className="border p-2 text-center font-bold">{p.status}</td>
                      <td className="border p-2 text-slate-700">{p.hasilEvaluasi || 'Sedang proses pelaksanaan'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SIGNATURE SECTION - Pengawas Resmi FAHRULAN ROZALI, M.Pd. */}
          <div className="pt-10 flex justify-end">
            <div className="w-80 text-center text-xs font-sans">
              <p className="text-slate-700">
                Pontianak, {dateStr}
                <br />
                Pengawas Sekolah Pembina,
              </p>
              <div className="h-16"></div>
              <p className="font-extrabold text-slate-900 underline text-sm tracking-wide">
                FAHRULAN ROZALI, M.Pd.
              </p>
              <p className="text-slate-600 text-[11px] font-mono mt-0.5">
                NIP. {supervisorProfile.nip}
              </p>
              <p className="text-slate-500 text-[10px]">
                {supervisorProfile.pangkatGolongan}
              </p>
              <p className="text-slate-400 text-[9px] mt-0.5">
                Dinas Pendidikan dan Kebudayaan Kota Pontianak
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
