import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Upload,
  Calendar,
  MessageSquare,
  Edit2,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionPlan, StatusPelaksanaan } from '../types';

export const MonitoringView: React.FC = () => {
  const { actionPlans, updateActionPlan, selectedJenjangFilter, setSelectedJenjangFilter, demoMode } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [evaluatingPlan, setEvaluatingPlan] = useState<ActionPlan | null>(null);

  const [evalFormData, setEvalFormData] = useState({
    status: 'Sedang dilaksanakan' as StatusPelaksanaan,
    hasilEvaluasi: '',
    buktiDukung: '',
    catatanPengawas: '',
  });

  const filteredPlans = actionPlans.filter((p) => {
    if (!demoMode && p.isDemo) return false;
    if (selectedJenjangFilter !== 'ALL' && p.jenjang !== selectedJenjangFilter) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.namaSekolah.toLowerCase().includes(term) ||
        p.bentukKegiatan.toLowerCase().includes(term) ||
        p.indikatorPrioritas.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalPlans = filteredPlans.length;
  const selesaiCount = filteredPlans.filter((p) => p.status === 'Selesai').length;
  const sedangCount = filteredPlans.filter((p) => p.status === 'Sedang dilaksanakan').length;
  const terencanaCount = filteredPlans.filter((p) => p.status === 'Direncanakan').length;
  const evaluasiCount = filteredPlans.filter((p) => p.status === 'Menunggu evaluasi').length;

  const handleOpenEvaluate = (plan: ActionPlan) => {
    setEvaluatingPlan(plan);
    setEvalFormData({
      status: plan.status,
      hasilEvaluasi: plan.hasilEvaluasi || '',
      buktiDukung: plan.buktiDukung || '',
      catatanPengawas: plan.catatanPengawas || '',
    });
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingPlan) return;

    updateActionPlan(evaluatingPlan.id, {
      status: evalFormData.status,
      hasilEvaluasi: evalFormData.hasilEvaluasi,
      buktiDukung: evalFormData.buktiDukung,
      catatanPengawas: evalFormData.catatanPengawas,
    });

    setEvaluatingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Monitoring & Evaluasi Tindak Lanjut Pendampingan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan realisasi kegiatan pendampingan pengawas, verifikasi bukti dukung, dan penilaian capaian.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Realisasi Selesai:</span>
          <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full">
            {selesaiCount} dari {totalPlans} ({totalPlans > 0 ? Math.round((selesaiCount / totalPlans) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Direncanakan</span>
          <span className="text-2xl font-black text-slate-800">{terencanaCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 block">Sedang Dilaksanakan</span>
          <span className="text-2xl font-black text-blue-700">{sedangCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 block">Menunggu Evaluasi</span>
          <span className="text-2xl font-black text-amber-700">{evaluasiCount}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 block">Selesai Terevaluasi</span>
          <span className="text-2xl font-black text-emerald-700">{selesaiCount}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari sekolah, kegiatan, atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedJenjangFilter}
            onChange={(e) => setSelectedJenjangFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">Jenjang SD</option>
            <option value="TK">Jenjang TK</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="Direncanakan">Direncanakan</option>
            <option value="Sedang dilaksanakan">Sedang dilaksanakan</option>
            <option value="Menunggu evaluasi">Menunggu evaluasi</option>
            <option value="Selesai">Selesai</option>
            <option value="Perlu tindak lanjut">Perlu tindak lanjut</option>
          </select>
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Satuan Pendidikan</th>
                <th className="py-3 px-4">Bentuk Kegiatan</th>
                <th className="py-3 px-3">Jadwal</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Bukti Dukung</th>
                <th className="py-3 px-4">Hasil Evaluasi Pengawas</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan, idx) => {
                  const isDone = plan.status === 'Selesai';
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{plan.namaSekolah}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Indikator: {plan.indikatorPrioritas}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{plan.bentukKegiatan}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {plan.jadwalPelaksanaan}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : plan.status === 'Sedang dilaksanakan'
                              ? 'bg-blue-100 text-blue-800'
                              : plan.status === 'Perlu tindak lanjut'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{plan.buktiDukung || 'Belum diunggah'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-[11px]">
                        {plan.hasilEvaluasi ? (
                          <p className="line-clamp-2">{plan.hasilEvaluasi}</p>
                        ) : (
                          <span className="text-slate-400 italic">Belum dievaluasi</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenEvaluate(plan)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Evaluasi
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ditemukan rencana pendampingan yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Evaluasi Monitoring */}
      {evaluatingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-[#0F2A4A] mb-1">
              Catat Monitoring & Evaluasi Pelaksanaan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {evaluatingPlan.namaSekolah} • {evaluatingPlan.bentukKegiatan}
            </p>

            <form onSubmit={handleSaveEvaluation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Pelaksanaan Terkini</label>
                <select
                  value={evalFormData.status}
                  onChange={(e) =>
                    setEvalFormData({ ...evalFormData, status: e.target.value as StatusPelaksanaan })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
                >
                  <option value="Sedang dilaksanakan">Sedang dilaksanakan</option>
                  <option value="Menunggu evaluasi">Menunggu evaluasi</option>
                  <option value="Selesai">Selesai (Bukti Dukung Terverifikasi)</option>
                  <option value="Perlu tindak lanjut">Perlu tindak lanjut tambahan</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Sesuai ketentuan, status tidak otomatis selesai hanya karena jadwal lewat, melainkan wajib
                  berdasarkan bukti nyata.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bukti Dukung yang Terkumpul</label>
                <input
                  type="text"
                  placeholder="Misal: Notula KKG, daftar hadir 12 guru, foto alat peraga, modul ajar..."
                  value={evalFormData.buktiDukung}
                  onChange={(e) => setEvalFormData({ ...evalFormData, buktiDukung: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hasil Evaluasi / Capaian</label>
                <textarea
                  rows={3}
                  placeholder="Catatan hasil pelaksanaan pendampingan di lapangan..."
                  value={evalFormData.hasilEvaluasi}
                  onChange={(e) => setEvalFormData({ ...evalFormData, hasilEvaluasi: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Pengawas</label>
                <textarea
                  rows={2}
                  placeholder="Rekomendasi tindak lanjut atau arahan pengawas berikutnya..."
                  value={evalFormData.catatanPengawas}
                  onChange={(e) => setEvalFormData({ ...evalFormData, catatanPengawas: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
