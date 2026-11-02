import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionPlan, BentukKegiatanPendampingan, StatusPelaksanaan, Jenjang } from '../types';

export const ActionPlansView: React.FC = () => {
  const {
    actionPlans,
    schools,
    addActionPlan,
    updateActionPlan,
    deleteActionPlan,
    selectedJenjangFilter,
    setSelectedJenjangFilter,
    demoMode,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);

  const bentukKegiatanList: BentukKegiatanPendampingan[] = [
    'Diskusi dengan kepala sekolah',
    'Pendampingan perencanaan berbasis data',
    'Refleksi bersama',
    'Analisis akar masalah',
    'Observasi pembelajaran',
    'Pendampingan guru',
    'Lokakarya',
    'Berbagi praktik baik',
    'Monitoring tindak lanjut',
    'Evaluasi perubahan capaian',
  ];

  const statusOptions: StatusPelaksanaan[] = [
    'Belum direncanakan',
    'Direncanakan',
    'Sedang dilaksanakan',
    'Menunggu evaluasi',
    'Selesai',
    'Perlu tindak lanjut',
  ];

  const selectableSchools = schools.filter((s) => demoMode || !s.isDemo);

  const [formData, setFormData] = useState({
    schoolId: '',
    tahun: 2024,
    indikatorPrioritas: '',
    temuanUtama: '',
    tujuanPendampingan: '',
    bentukKegiatan: 'Pendampingan perencanaan berbasis data' as BentukKegiatanPendampingan,
    langkahKegiatan: '',
    sasaran: '',
    pihakTerlibat: 'Pengawas Sekolah, Kepala Sekolah, Dewan Guru',
    jadwalPelaksanaan: '15-03-2026',
    targetKeberhasilan: '',
    buktiDukung: 'Notula, daftar hadir, dan foto kegiatan',
    penanggungJawab: '',
    status: 'Direncanakan' as StatusPelaksanaan,
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
        p.indikatorPrioritas.toLowerCase().includes(term) ||
        p.bentukKegiatan.toLowerCase().includes(term) ||
        p.tujuanPendampingan.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      schoolId: selectableSchools[0]?.id || '',
      tahun: 2024,
      indikatorPrioritas: '',
      temuanUtama: '',
      tujuanPendampingan: '',
      bentukKegiatan: 'Pendampingan perencanaan berbasis data',
      langkahKegiatan: '1. Diskusi awal\n2. Telaah dokumen\n3. Observasi',
      sasaran: 'Kepala Sekolah dan Dewan Guru',
      pihakTerlibat: 'Pengawas Sekolah, Kepala Sekolah, Dewan Guru',
      jadwalPelaksanaan: '15-03-2026',
      targetKeberhasilan: '',
      buktiDukung: 'Notula pertemuan dan instrumen supervisi',
      penanggungJawab: selectableSchools[0]?.kepalaSekolah || '',
      status: 'Direncanakan',
      catatanPengawas: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: ActionPlan) => {
    setEditingPlan(plan);
    setFormData({
      schoolId: plan.schoolId,
      tahun: plan.tahun,
      indikatorPrioritas: plan.indikatorPrioritas,
      temuanUtama: plan.temuanUtama,
      tujuanPendampingan: plan.tujuanPendampingan,
      bentukKegiatan: plan.bentukKegiatan,
      langkahKegiatan: plan.langkahKegiatan.join('\n'),
      sasaran: plan.sasaran,
      pihakTerlibat: plan.pihakTerlibat.join(', '),
      jadwalPelaksanaan: plan.jadwalPelaksanaan,
      targetKeberhasilan: plan.targetKeberhasilan,
      buktiDukung: plan.buktiDukung,
      penanggungJawab: plan.penanggungJawab,
      status: plan.status,
      catatanPengawas: plan.catatanPengawas || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const school = schools.find((s) => s.id === formData.schoolId);
    if (!school) return;

    const stepsArray = formData.langkahKegiatan
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const partiesArray = formData.pihakTerlibat
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingPlan) {
      updateActionPlan(editingPlan.id, {
        schoolId: school.id,
        namaSekolah: school.nama,
        jenjang: school.jenjang,
        tahun: formData.tahun,
        indikatorPrioritas: formData.indikatorPrioritas,
        temuanUtama: formData.temuanUtama,
        tujuanPendampingan: formData.tujuanPendampingan,
        bentukKegiatan: formData.bentukKegiatan,
        langkahKegiatan: stepsArray,
        sasaran: formData.sasaran,
        pihakTerlibat: partiesArray,
        jadwalPelaksanaan: formData.jadwalPelaksanaan,
        targetKeberhasilan: formData.targetKeberhasilan,
        buktiDukung: formData.buktiDukung,
        penanggungJawab: formData.penanggungJawab || school.kepalaSekolah,
        status: formData.status,
        catatanPengawas: formData.catatanPengawas,
      });
    } else {
      addActionPlan({
        schoolId: school.id,
        namaSekolah: school.nama,
        jenjang: school.jenjang,
        tahun: formData.tahun,
        indikatorPrioritas: formData.indikatorPrioritas,
        temuanUtama: formData.temuanUtama,
        tujuanPendampingan: formData.tujuanPendampingan,
        bentukKegiatan: formData.bentukKegiatan,
        langkahKegiatan: stepsArray,
        sasaran: formData.sasaran,
        pihakTerlibat: partiesArray,
        jadwalPelaksanaan: formData.jadwalPelaksanaan,
        targetKeberhasilan: formData.targetKeberhasilan,
        buktiDukung: formData.buktiDukung,
        penanggungJawab: formData.penanggungJawab || school.kepalaSekolah,
        status: formData.status,
        catatanPengawas: formData.catatanPengawas,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Rencana Pendampingan Satuan Pendidikan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Terjemahan hasil analisis indikator Rapor Pendidikan menjadi program pendampingan konkret, terjadwal,
            dan terukur bagi kepala sekolah dan guru binaan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-700/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Rencana Baru
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama sekolah, bentuk kegiatan, atau indikator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-blue-500 bg-slate-50 focus:bg-white"
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
            <option value="TK">Jenjang TK</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="ALL">Semua Status Pelaksanaan</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Plans Cards */}
      <div className="space-y-4">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => {
            const isCompleted = plan.status === 'Selesai';
            const isOngoing = plan.status === 'Sedang dilaksanakan';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:border-blue-300 space-y-3 ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isOngoing
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${
                        plan.jenjang === 'SD'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {plan.jenjang}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0F2A4A]">{plan.namaSekolah}</h3>
                    <span className="text-xs text-slate-400 font-mono">Tahun {plan.tahun}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOngoing
                          ? 'bg-blue-100 text-blue-800'
                          : plan.status === 'Perlu tindak lanjut'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {plan.status}
                    </span>

                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100"
                      title="Edit rencana"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteActionPlan(plan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                      title="Hapus rencana"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Bentuk Kegiatan:
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{plan.bentukKegiatan}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Indikator Prioritas Terkait:
                      </span>
                      <p className="font-semibold text-blue-800">{plan.indikatorPrioritas}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tujuan Pendampingan:
                      </span>
                      <p className="text-slate-700">{plan.tujuanPendampingan}</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">Jadwal Pelaksanaan:</span>
                      <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {plan.jadwalPelaksanaan}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">Sasaran:</span>
                      <span className="text-slate-700 font-medium">{plan.sasaran}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">Penanggung Jawab:</span>
                      <span className="text-slate-700 font-medium">{plan.penanggungJawab}</span>
                    </div>

                    <div className="pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="font-bold text-slate-500 block mb-0.5">Target Keberhasilan:</span>
                      <p className="text-slate-700">{plan.targetKeberhasilan}</p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                {plan.langkahKegiatan && plan.langkahKegiatan.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-600 block mb-1">Tahapan Kegiatan:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                      {plan.langkahKegiatan.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Belum Ada Rencana Pendampingan</p>
            <p className="text-xs text-slate-400 mt-1">
              Buat rencana pendampingan baru secara manual atau ubah rekomendasi hasil analisis AI menjadi rencana kerja.
            </p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Action Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in">
            <h3 className="text-lg font-bold text-[#0F2A4A] mb-1">
              {editingPlan ? 'Edit Rencana Pendampingan' : 'Susun Rencana Pendampingan Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Rumuskan kegiatan supervisi suportif sesuai temuan indikator prioritas Rapor Pendidikan.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Satuan Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">-- Pilih Sekolah --</option>
                    {selectableSchools.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        [{sch.jenjang}] {sch.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Analisis</label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bentuk Kegiatan Pendampingan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.bentukKegiatan}
                  onChange={(e) => setFormData({ ...formData, bentukKegiatan: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  {bentukKegiatanList.map((bk) => (
                    <option key={bk} value={bk}>
                      {bk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Indikator Prioritas Terkait <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A.2 Kemampuan Numerasi & D.1 Kualitas Pembelajaran"
                  value={formData.indikatorPrioritas}
                  onChange={(e) => setFormData({ ...formData, indikatorPrioritas: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tujuan Pendampingan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan tujuan spesifik dan terukur yang ingin dicapai..."
                  value={formData.tujuanPendampingan}
                  onChange={(e) => setFormData({ ...formData, tujuanPendampingan: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Langkah-Langkah Kegiatan (1 baris per langkah)
                </label>
                <textarea
                  rows={3}
                  placeholder="Langkah 1&#10;Langkah 2&#10;Langkah 3"
                  value={formData.langkahKegiatan}
                  onChange={(e) => setFormData({ ...formData, langkahKegiatan: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jadwal Pelaksanaan (DD-MM-YYYY) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15-03-2026"
                    value={formData.jadwalPelaksanaan}
                    onChange={(e) => setFormData({ ...formData, jadwalPelaksanaan: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pelaksanaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusPelaksanaan })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sasaran Peserta</label>
                  <input
                    type="text"
                    placeholder="Contoh: Seluruh Guru Kelas 1-6"
                    value={formData.sasaran}
                    onChange={(e) => setFormData({ ...formData, sasaran: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Nama Kepala Sekolah / Pengawas"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Keberhasilan</label>
                <input
                  type="text"
                  placeholder="Target indikator output nyata..."
                  value={formData.targetKeberhasilan}
                  onChange={(e) => setFormData({ ...formData, targetKeberhasilan: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20"
                >
                  Simpan Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
