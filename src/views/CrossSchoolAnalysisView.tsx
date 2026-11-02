import React, { useState } from 'react';
import {
  Network,
  GraduationCap,
  Baby,
  Users,
  Award,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeCrossSchoolData } from '../utils/analysisEngine';
import { Jenjang } from '../types';

export const CrossSchoolAnalysisView: React.FC = () => {
  const { schools, raporRecords, setActiveTab, setSelectedSchoolId, demoMode } = useApp();

  const [activeJenjang, setActiveJenjang] = useState<Jenjang>('SD');
  const [selectedTahun, setSelectedTahun] = useState<number>(2024);

  const availableYears = Array.from(new Set(raporRecords.map((r) => r.tahun))).sort((a, b) => b - a);
  const activeYear = availableYears.includes(selectedTahun) ? selectedTahun : (availableYears[0] || 2024);

  // Filter schools (omit demo if demo mode off)
  const targetSchools = schools.filter((s) => demoMode || !s.isDemo);

  const crossAnalysis = analyzeCrossSchoolData(
    targetSchools,
    raporRecords,
    activeJenjang,
    activeYear
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Analisis Lintas Sekolah Satuan Pendidikan Binaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pemetaan komparatif, klaster kebutuhan pendampingan bersama, dan diseminasi praktik baik untuk{' '}
            {activeJenjang === 'SD' ? '12 Sekolah Dasar' : '5 Taman Kanak-Kanak'}.
          </p>
        </div>

        {/* Level Tabs (Strict Separate Views for SD vs TK - Mandat Bagian 8 & 9) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveJenjang('SD')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeJenjang === 'SD'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Rekapitulasi 12 SD
            </button>
            <button
              onClick={() => setActiveJenjang('TK')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                activeJenjang === 'TK'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-4 h-4" />
              Rekapitulasi 5 TK
            </button>
          </div>

          <select
            value={activeYear}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            className="text-xs font-bold p-2 border border-slate-200 rounded-xl bg-white"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Separation Rule Notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Kaidah Metodologis Pengawasan:</strong> Indikator capaian jenjang SD dan TK dianalisis
          secara mandiri dan tidak dibandingkan silang karena perbedaan instrumen penilaian (AN / Sulinjar
          pada SD vs Standar Tingkat Pencapaian Perkembangan Anak / PAUD HI pada TK).
        </p>
      </div>

      {/* Section 1: Tema Pendampingan Bersama (Clusters for Supervisor) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0F2A4A] flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Tema Kebutuhan Pendampingan Bersama (Gugus / KKG Mini)
            </h3>
            <p className="text-xs text-slate-500">
              Pengelompokan satuan pendidikan yang menghadapi tantangan serupa untuk efisiensi intervensi pengawas.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {crossAnalysis.temaPendampinganBersama.length} Tema Teridentifikasi
          </span>
        </div>

        {crossAnalysis.temaPendampinganBersama.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {crossAnalysis.temaPendampinganBersama.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs space-y-2 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] bg-white text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-sm">
                    {t.kodeIndikator}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                    {t.jumlahSekolahTerdampak} Sekolah Binaan
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{t.tema}</h4>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Daftar Sekolah Terdampak:
                  </span>
                  <p className="text-slate-700 font-medium">{t.daftarSekolah.join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900 font-semibold">
                  <span>Saran Aksi: {t.rekomendasiBentukKegiatan}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            Tidak ditemukan klaster permasalahan bersama pada periode ini.
          </div>
        )}
      </div>

      {/* Section 2: Sumber Praktik Baik (Benchmarking Satuan Unggul) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0F2A4A] flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Sekolah Berpotensi Sebagai Sumber Praktik Baik
            </h3>
            <p className="text-xs text-slate-500">
              Satuan pendidikan yang menunjukkan capaian optimal atau lonjakan signifikan dan layak berbagi pengalaman.
            </p>
          </div>
        </div>

        {crossAnalysis.sumberPraktikBaik.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crossAnalysis.sumberPraktikBaik.slice(0, 6).map((bp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{bp.namaSekolah}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm text-[10px]">
                    Skor {bp.nilaiCapaian}
                  </span>
                </div>
                <p className="font-semibold text-blue-900 text-[11px]">
                  {bp.kodeIndikator} - {bp.namaIndikator}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{bp.alasanPraktikBaik}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            Belum ada data sekolah dengan predikat sangat unggul pada filter saat ini.
          </div>
        )}
      </div>

      {/* Section 3: Comparative Indicator Matrix Table (Mandat Bagian 9) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Matriks Capaian Seluruh {activeJenjang === 'SD' ? '12 SD' : '5 TK'} Binaan (Tahun {activeYear})
            </h3>
            <p className="text-[11px] text-slate-500">
              Warna sel mencerminkan arah perkembangan deterministik (Hijau = Membaik, Merah = Menurun, Abu-abu = Belum Ada Data).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Satuan Pendidikan</th>
                <th className="py-3 px-3 text-center">Data Terinput</th>
                <th className="py-3 px-3 text-center">Membaik</th>
                <th className="py-3 px-3 text-center">Menurun</th>
                <th className="py-3 px-3 text-center">Prioritas Atensi</th>
                <th className="py-3 px-4">Fokus Pendampingan Utama</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {crossAnalysis.rekapitulasiSekolah.map(({ school, summary, hasData }, idx) => (
                <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{school.nama}</p>
                    <p className="text-[11px] text-slate-400">NPSN: {school.npsn} • {school.kecamatan}</p>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold">
                    {hasData ? (
                      <span className="text-blue-800 font-mono">{summary.totalIndikator} Indikator</span>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">
                    {hasData ? summary.membaik : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-rose-700">
                    {hasData ? summary.menurun : '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {hasData && summary.indikatorPrioritas.length > 0 ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-sm font-bold">
                        {summary.indikatorPrioritas.length} Indikator
                      </span>
                    ) : hasData ? (
                      <span className="text-emerald-600 font-semibold text-[11px]">Stabil</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {hasData && summary.indikatorPrioritas.length > 0 ? (
                      <span className="truncate block max-w-xs">
                        {summary.indikatorPrioritas.slice(0, 2).map((p) => p.namaIndikator).join(', ')}
                      </span>
                    ) : hasData ? (
                      <span className="text-slate-500 italic">Pemeliharaan mutu berkelanjutan</span>
                    ) : (
                      <span className="text-slate-400 italic">Perlu pengumpulan Rapor</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedSchoolId(school.id);
                        setActiveTab('analisis-sekolah');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                    >
                      Detail
                    </button>
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
