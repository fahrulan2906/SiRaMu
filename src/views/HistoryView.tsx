import React, { useState } from 'react';
import {
  History,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToXLSX } from '../utils/exportHelpers';

export const HistoryView: React.FC = () => {
  const { analysisRecords, uploadBatches, schools, raporRecords, demoMode } = useApp();

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');

  const filteredAnalyses = analysisRecords.filter((a) => {
    if (!demoMode && a.isDemo) return false;
    if (selectedSchoolId !== 'ALL' && a.schoolId !== selectedSchoolId) return false;
    return true;
  });

  const handleExportHistory = () => {
    const exportData = filteredAnalyses.map((a) => ({
      'Nama Satuan Pendidikan': a.namaSekolah,
      Jenjang: a.jenjang,
      'Tahun Rapor': a.tahun,
      'Tanggal Analisis': new Date(a.waktuAnalisis).toLocaleDateString('id-ID'),
      'Model AI': a.modelDigunakan,
      'Total Indikator': a.totalIndikator,
      'Indikator Membaik': a.indikatorMembaik,
      'Indikator Menurun': a.indikatorMenurun,
      'Status Validasi': a.statusValidasiPengawas,
      'Ringkasan Eksekutif': a.hasilAI.ringkasan_eksekutif,
      'Kesimpulan Pengawas': a.hasilAI.kesimpulan,
    }));

    exportToXLSX(exportData, `Riwayat_Analisis_Rapor_Pontianak`, 'Riwayat_Analisis');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Riwayat Analisis & Log Perkembangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak evaluasi Rapor Pendidikan dari tahun ke tahun, audit log impor berkas, dan histori validasi pengawas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-slate-50"
          >
            <option value="ALL">Semua Satuan Binaan</option>
            {schools.filter((s) => demoMode || !s.isDemo).map((s) => (
              <option key={s.id} value={s.id}>
                [{s.jenjang}] {s.nama}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportHistory}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Ekspor Riwayat (Excel)
          </button>
        </div>
      </div>

      {/* Analysis Chronological List */}
      <div className="space-y-4">
        {filteredAnalyses.length > 0 ? (
          filteredAnalyses.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                      rec.jenjang === 'SD'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {rec.jenjang}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rec.namaSekolah}</h3>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                    Tahun Evaluasi: {rec.tahun}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">
                    {new Date(rec.waktuAnalisis).toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                      rec.statusValidasiPengawas === 'Divalidasi Lengkap'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.statusValidasiPengawas}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 block">Total Indikator</span>
                  <span className="font-bold text-slate-800 text-sm">{rec.totalIndikator}</span>
                </div>
                <div className="p-2.5 bg-emerald-50/50 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-700 block">Indikator Membaik</span>
                  <span className="font-bold text-emerald-700 text-sm">+{rec.indikatorMembaik}</span>
                </div>
                <div className="p-2.5 bg-rose-50/50 rounded-lg">
                  <span className="text-[10px] font-bold text-rose-700 block">Indikator Menurun</span>
                  <span className="font-bold text-rose-700 text-sm">-{rec.indikatorMenurun}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 block">Model Digunakan</span>
                  <span className="font-mono font-semibold text-slate-700 text-xs">
                    {rec.modelDigunakan}
                  </span>
                </div>
              </div>

              {/* Executive Summary Snippet */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {rec.hasilAI.ringkasan_eksekutif}
              </p>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Belum Ada Riwayat Analisis</p>
            <p className="text-xs text-slate-400 mt-1">
              Jalankan analisis Rapor Pendidikan pada menu "Analisis Per Sekolah" untuk menyimpan riwayat baru.
            </p>
          </div>
        )}
      </div>

      {/* Batch Upload History Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Log Riwayat Unggah Dokumen Rapor Pendidikan
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Nama Berkas</th>
                <th className="py-2.5 px-3">Satuan Pendidikan</th>
                <th className="py-2.5 px-3">Jenjang</th>
                <th className="py-2.5 px-3 text-center">Tahun Rapor</th>
                <th className="py-2.5 px-3 text-center">Waktu Unggah</th>
                <th className="py-2.5 px-3 text-center">Jumlah Baris</th>
                <th className="py-2.5 px-3 text-center">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uploadBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800">{batch.namaFile}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{batch.namaSekolah}</td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-700">{batch.jenjang}</span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono">{batch.tahun}</td>
                  <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {batch.tanggalUnggah}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-blue-900">{batch.jumlahBaris}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                        batch.statusValidasi === 'Berhasil'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {batch.statusValidasi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
