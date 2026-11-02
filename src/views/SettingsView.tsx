import React, { useState } from 'react';
import {
  Settings,
  UserCheck,
  Database,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  Info,
  Server,
  Key,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    supervisorProfile,
    updateSupervisorProfile,
    deleteDemoData,
    resetToDefault17Schools,
    demoMode,
    setDemoMode,
  } = useApp();

  const [formData, setFormData] = useState({ ...supervisorProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setFormData({ ...supervisorProfile });
  }, [supervisorProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupervisorProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Pengaturan Aplikasi & Profil Pengawas Sekolah
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas pengawas sekolah pembina, pengaturan penyimpanan data, dan pengelolaan data simulasi.
        </p>
      </div>

      {/* Profil Pengawas Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Identitas Resmi Pengawas Sekolah Pembina
            </h3>
            <p className="text-xs text-slate-500">
              Data ini akan dicantumkan secara otomatis pada bagian titimangsa dan tanda tangan laporan resmi.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Tersimpan
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar Pengawas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP Pengawas (18 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pangkat / Golongan Ruang</label>
              <input
                type="text"
                placeholder="Misal: Pembina Utama Muda / IV c"
                value={formData.pangkatGolongan}
                onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instansi Induk</label>
              <input
                type="text"
                value={formData.instansi}
                onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Wilayah Satuan Binaan</label>
              <input
                type="text"
                value={formData.wilayahBinaan}
                onChange={(e) => setFormData({ ...formData, wilayahBinaan: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor SK Penugasan Pengawas</label>
              <input
                type="text"
                placeholder="Misal: 800/124/DISDIKBUD-PTK/2026"
                value={formData.nomorSK || ''}
                onChange={(e) => setFormData({ ...formData, nomorSK: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-700/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Pengawas
            </button>
          </div>
        </form>
      </div>

      {/* Storage and Database Layer Status (Mandat Bagian 13 & 14) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Status Penyimpanan Data & Keamanan (Data Layer)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              Penyimpanan Aktif: Sinkronisasi Ganda (Lokal & Server)
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Aplikasi menyimpan data sekolah, indikator, riwayat, dan rencana di media penyimpanan browser
              (Local Storage) serta dicadangkan secara berkala ke database file JSON aman di sisi server.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Privasi & Perlindungan Data Guru/Siswa
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Informasi personal guru/siswa tidak ditransmisikan ke Gemini API. Hanya agregat skor indikator
              resmi Rapor Pendidikan yang diproses untuk menjaga kerahasiaan data.
            </p>
          </div>
        </div>

        {/* Firebase Cloud Storage Integration Guidelines */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-xs text-blue-950 space-y-2">
          <span className="font-bold block text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-700" />
            Integrasi Cloud Firestore / Firebase (Pengembangan Lanjutan)
          </span>
          <p className="leading-relaxed text-[11px]">
            Sesuai panduan arsitektur sistem pengawasan, jika Dinas Pendidikan Kota Pontianak menghendaki
            penyimpanan multi-pengguna terpusat via Google Cloud Firestore, proyek dapat diprovisikan dengan
            skema koleksi yang telah disiapkan (<code>schools</code>, <code>rapor_uploads</code>,{' '}
            <code>indicator_results</code>, <code>analysis_history</code>, <code>action_plans</code>).
          </p>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-700">
          <Trash2 className="w-4 h-4" />
          Pengelolaan Data Demonstrasi & Reset Awal
        </h3>
        <p className="text-xs text-slate-500">
          Gunakan tombol di bawah ini untuk membersihkan data simulasi percontohan atau mengembalikan 17 satuan binaan ke template awal.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={deleteDemoData}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Hapus Seluruh Data Demonstrasi
          </button>
          <button
            onClick={resetToDefault17Schools}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset 17 Sekolah Awal (SD 01-12 & TK 01-05)
          </button>
        </div>
      </div>
    </div>
  );
};
