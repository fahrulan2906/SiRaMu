import React, { useState } from 'react';
import {
  BookOpenCheck,
  Search,
  Layers,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INDICATOR_DICTIONARY } from '../data/initialData';
import { Jenjang } from '../types';

export const IndicatorsView: React.FC = () => {
  const { raporRecords, schools, selectedJenjangFilter, setSelectedJenjangFilter, demoMode } =
    useApp();

  const [activeTabSub, setActiveTabSub] = useState<'kamus' | 'masterData'>('kamus');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDimensi, setSelectedDimensi] = useState<string>('ALL');

  // Filter dictionary
  const filteredDict = INDICATOR_DICTIONARY.filter((ind) => {
    if (selectedJenjangFilter !== 'ALL' && ind.jenjang !== selectedJenjangFilter) return false;
    if (selectedDimensi !== 'ALL' && ind.dimensi !== selectedDimensi) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        ind.kode.toLowerCase().includes(term) ||
        ind.nama.toLowerCase().includes(term) ||
        ind.definisi.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Filtered actual records
  const filteredRecords = raporRecords.filter((r) => {
    if (!demoMode && r.isDemo) return false;
    if (selectedJenjangFilter !== 'ALL' && r.jenjang !== selectedJenjangFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.namaSekolah.toLowerCase().includes(term) ||
        r.kodeIndikator.toLowerCase().includes(term) ||
        r.namaIndikator.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const dimensiList = Array.from(new Set(INDICATOR_DICTIONARY.map((d) => d.dimensi)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-blue-600" />
            Kamus Indikator & Master Data Rapor Pendidikan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rujukan definisi resmi, dimensi, kategori ambang batas, dan metadata indikator sesuai regulasi
            Kemendikbudristek untuk jenjang SD dan TK/PAUD.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTabSub('kamus')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabSub === 'kamus'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kamus Resmi ({filteredDict.length})
          </button>
          <button
            onClick={() => setActiveTabSub('masterData')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTabSub === 'masterData'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Indikator Tersimpan ({filteredRecords.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode indikator, nama, atau kata kunci definisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Jenjang Filter */}
          <select
            value={selectedJenjangFilter}
            onChange={(e) => setSelectedJenjangFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">Jenjang SD</option>
            <option value="TK">Jenjang TK / PAUD</option>
          </select>

          {/* Dimensi Filter (only in Kamus view) */}
          {activeTabSub === 'kamus' && (
            <select
              value={selectedDimensi}
              onChange={(e) => setSelectedDimensi(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 max-w-xs"
            >
              <option value="ALL">Semua Dimensi</option>
              {dimensiList.map((dim) => (
                <option key={dim} value={dim}>
                  {dim}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: Kamus Indikator Resmi */}
      {activeTabSub === 'kamus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDict.map((item) => (
            <div
              key={`${item.jenjang}-${item.kode}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-blue-100 text-blue-900 px-2.5 py-1 rounded-md">
                    {item.kode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                      item.jenjang === 'SD'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Jenjang {item.jenjang}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{item.satuan}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{item.nama}</h3>
                <p className="text-[11px] font-semibold text-blue-700 mt-0.5">{item.dimensi}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {item.definisi}
              </p>

              {/* Kategori Resmi Ambang Batas */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Kategori Capaian Resmi:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.kategoriResmi.map((kat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200"
                    >
                      {kat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Sumber: {item.sumberDefinisi}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sebanding Antartahun
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Data Indikator Tersimpan (Master Data) */}
      {activeTabSub === 'masterData' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Sekolah</th>
                  <th className="py-3 px-3">Tahun</th>
                  <th className="py-3 px-3">Kode</th>
                  <th className="py-3 px-4">Nama Indikator</th>
                  <th className="py-3 px-3 text-center">Nilai Capaian</th>
                  <th className="py-3 px-3 text-center">Kategori</th>
                  <th className="py-3 px-3 text-center">Nilai Lalu</th>
                  <th className="py-3 px-3 text-center">Perubahan</th>
                  <th className="py-3 px-4">Dokumen Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{r.namaSekolah}</span>
                        <span className="text-[10px] text-slate-400 font-mono">NPSN: {r.npsn}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{r.tahun}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{r.kodeIndikator}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{r.namaIndikator}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-800">
                        {r.nilaiCapaian ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {r.kategoriCapaian || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {r.nilaiTahunLalu ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            r.arahPerubahan === 'MEMBAIK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.arahPerubahan === 'MENURUN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.arahPerubahan}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                        {r.dokumenSumber}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      Belum ada data indikator tersimpan yang sesuai filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
