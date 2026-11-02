import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UploadCloud,
  FileSearch,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { School, Jenjang, KecamatanPontianak } from '../types';
import { calculateSchoolSummary } from '../utils/analysisEngine';

export const SchoolsView: React.FC = () => {
  const {
    schools,
    raporRecords,
    analysisRecords,
    addSchool,
    updateSchool,
    deleteSchool,
    resetToDefault17Schools,
    setSelectedSchoolId,
    setActiveTab,
    selectedJenjangFilter,
    setSelectedJenjangFilter,
    demoMode,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    npsn: '',
    nama: '',
    jenjang: 'SD' as Jenjang,
    kecamatan: 'Pontianak Kota' as KecamatanPontianak,
    alamat: '',
    kepalaSekolah: '',
    nipKepalaSekolah: '',
  });

  const kecamatanOptions: KecamatanPontianak[] = [
    'Pontianak Barat',
    'Pontianak Kota',
    'Pontianak Selatan',
    'Pontianak Tenggara',
    'Pontianak Timur',
    'Pontianak Utara',
  ];

  // Filtered Schools
  const filteredSchools = schools
    .filter((s) => {
      if (!demoMode && s.isDemo) return false;
      if (selectedJenjangFilter !== 'ALL' && s.jenjang !== selectedJenjangFilter) return false;
      if (filterKecamatan !== 'ALL' && s.kecamatan !== filterKecamatan) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          s.nama.toLowerCase().includes(term) ||
          s.npsn.includes(term) ||
          s.kepalaSekolah.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const handleOpenAdd = () => {
    setEditingSchool(null);
    setFormData({
      npsn: '',
      nama: '',
      jenjang: 'SD',
      kecamatan: 'Pontianak Kota',
      alamat: '',
      kepalaSekolah: '',
      nipKepalaSekolah: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      npsn: school.npsn,
      nama: school.nama,
      jenjang: school.jenjang,
      kecamatan: school.kecamatan,
      alamat: school.alamat,
      kepalaSekolah: school.kepalaSekolah,
      nipKepalaSekolah: school.nipKepalaSekolah || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.npsn.trim()) {
      return;
    }

    if (editingSchool) {
      updateSchool(editingSchool.id, {
        ...formData,
        isVerified: true, // Mark as verified once edited by supervisor
      });
    } else {
      addSchool(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSchool(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A]">
              Data Satuan Pendidikan Binaan
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredSchools.length} Sekolah
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data 12 SD dan 5 TK binaan Pengawas Sekolah Dinas Pendidikan dan Kebudayaan Kota Pontianak.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={resetToDefault17Schools}
            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            title="Kembalikan daftar 17 sekolah binaan ke data awal"
          >
            Reset 17 Sekolah Awal
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Sekolah
          </button>
        </div>
      </div>

      {/* Unverified Sample Data Banner */}
      {schools.some((s) => !s.isVerified && !s.isDemo) && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Perhatian: Sekolah Bertanda "Contoh Belum Diverifikasi"</p>
            <p className="text-amber-800/90 leading-relaxed">
              Daftar awal 17 sekolah (SD Binaan 01–12 & TK Binaan 01–05) disediakan sebagai penampung sementara.
              Klik tombol <strong>Edit</strong> pada masing-masing baris untuk memperbarui nama sekolah, NPSN, dan
              identitas Kepala Sekolah sesuai Surat Keputusan (SK) Wilayah Binaan yang sebenarnya.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama sekolah, NPSN, atau kepala sekolah..."
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
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-blue-500"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">Jenjang SD</option>
            <option value="TK">Jenjang TK</option>
          </select>

          {/* Kecamatan Filter */}
          <select
            value={filterKecamatan}
            onChange={(e) => setFilterKecamatan(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-blue-500"
          >
            <option value="ALL">Semua Kecamatan di Pontianak</option>
            {kecamatanOptions.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 17 Schools Management Table (Mandat Bagian 3) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">NPSN</th>
                <th className="py-3 px-4">Nama Satuan Pendidikan</th>
                <th className="py-3 px-3">Jenjang</th>
                <th className="py-3 px-3">Kecamatan</th>
                <th className="py-3 px-4">Kepala Sekolah</th>
                <th className="py-3 px-3 text-center">Tahun Data</th>
                <th className="py-3 px-3 text-center">Status Data</th>
                <th className="py-3 px-3 text-center">Analisis</th>
                <th className="py-3 px-3 text-center">Tgl Analisis</th>
                <th className="py-3 px-3 text-center">Perlu Atensi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school, index) => {
                  const schoolRecords = raporRecords.filter((r) => r.schoolId === school.id);
                  const latestRecord = schoolRecords[0];
                  const latestYear = latestRecord?.tahun ?? null;
                  const hasData = schoolRecords.length > 0;

                  const analysis = analysisRecords.find((a) => a.schoolId === school.id);
                  const isAnalyzed = Boolean(analysis);

                  const summary = hasData && latestYear
                    ? calculateSchoolSummary(schoolRecords, school, latestYear)
                    : null;

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {school.npsn}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {school.nama}
                          {school.isDemo && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-semibold">
                              DEMO
                            </span>
                          )}
                          {!school.isVerified && !school.isDemo && (
                            <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-sm font-medium">
                              Belum Diverifikasi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{school.alamat}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-sm text-[11px] ${
                            school.jenjang === 'SD'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {school.jenjang}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {school.kecamatan}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{school.kepalaSekolah}</p>
                        {school.nipKepalaSekolah && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            NIP. {school.nipKepalaSekolah}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-semibold">
                        {latestYear ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-mono">
                            {latestYear}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {hasData ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            {schoolRecords.length} Indikator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                            Belum Ada Data
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isAnalyzed ? (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                            Sudah
                          </span>
                        ) : hasData ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                            Menunggu
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center text-[11px] text-slate-500 font-mono">
                        {analysis?.waktuAnalisis
                          ? new Date(analysis.waktuAnalisis).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {summary && summary.indikatorPrioritas.length > 0 ? (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">
                            {summary.indikatorPrioritas.length}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Unggah Shortcut */}
                          <button
                            onClick={() => {
                              setSelectedSchoolId(school.id);
                              setActiveTab('unggah');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Unggah Data Rapor untuk sekolah ini"
                          >
                            <UploadCloud className="w-4 h-4" />
                          </button>

                          {/* Analisis Shortcut */}
                          <button
                            onClick={() => {
                              setSelectedSchoolId(school.id);
                              setActiveTab('analisis-sekolah');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Buka Analisis Rapor"
                          >
                            <FileSearch className="w-4 h-4" />
                          </button>

                          {/* Edit School */}
                          <button
                            onClick={() => handleOpenEdit(school)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit data sekolah / ganti nama contoh"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete School */}
                          <button
                            onClick={() => setDeleteConfirmId(school.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus sekolah"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    Tidak ditemukan sekolah yang sesuai dengan kata kunci atau filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit School */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#0F2A4A] mb-1">
              {editingSchool ? 'Edit Data Satuan Pendidikan' : 'Tambah Satuan Pendidikan Binaan'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Masukkan identitas resmi sekolah sesuai data Dapodik / Dinas Pendidikan Kota Pontianak.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NPSN (8 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    pattern="[0-9]{8}"
                    placeholder="Contoh: 30105001"
                    value={formData.npsn}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenjang Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as Jenjang })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                  >
                    <option value="SD">Sekolah Dasar (SD)</option>
                    <option value="TK">Taman Kanak-Kanak (TK / PAUD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Satuan Pendidikan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SD Negeri 05 Pontianak Barat"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kecamatan (Kota Pontianak) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kecamatan}
                  onChange={(e) =>
                    setFormData({ ...formData, kecamatan: e.target.value as KecamatanPontianak })
                  }
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                >
                  {kecamatanOptions.map((kec) => (
                    <option key={kec} value={kec}>
                      {kec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Sekolah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Kom Yos Sudarso No. 45"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap & gelar"
                    value={formData.kepalaSekolah}
                    onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    placeholder="18 digit NIP jika ada"
                    value={formData.nipKepalaSekolah}
                    onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20 transition-all cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Konfirmasi Hapus Sekolah</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus sekolah ini? Seluruh data Rapor Pendidikan, riwayat analisis,
              dan rencana pendampingan terkait akan ikut dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
