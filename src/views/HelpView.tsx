import React from 'react';
import {
  HelpCircle,
  BookOpen,
  UploadCloud,
  FileSearch,
  CalendarClock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Building,
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const guides = [
    {
      title: '1. Manajemen 17 Satuan Pendidikan Binaan',
      icon: Building,
      desc: 'Pengawas sekolah diamanahkan membina 12 SD dan 5 TK di wilayah Kota Pontianak. Pada tahap awal, sistem menyediakan 17 baris contoh bertanda "Belum Diverifikasi". Klik ikon Edit pada menu Data Sekolah Binaan untuk memasukkan nama resmi sekolah, NPSN, dan nama Kepala Sekolah.',
    },
    {
      title: '2. Mengunggah Dokumen Rapor Pendidikan',
      icon: UploadCloud,
      desc: 'Buka menu Unggah Rapor. Pilih sekolah target dan tahun data. Unggah file spreadsheet (XLSX atau CSV). Sistem akan secara otomatis mendeteksi kolom. Anda dapat menyesuaikan pemetaan nama kolom, memilih sheet, dan meninjau validasi baris sebelum data disimpan.',
    },
    {
      title: '3. Menjalankan Analisis Per Sekolah',
      icon: FileSearch,
      desc: 'Pilih sekolah dan tahun. Sistem pertama-tama menghitung capaian deterministik (indikator membaik, menurun, dan prioritas). Kemudian, mesin AI Gemini 3.8 Flash akan merangkum ringkasan eksekutif, kekuatan sekolah, hipotesis akar masalah, serta rekomendasi pendampingan terukur.',
    },
    {
      title: '4. Memvalidasi Hasil AI & Membuat Rencana Pendampingan',
      icon: ShieldCheck,
      desc: 'Rekomendasi yang dihasilkan AI memiliki status awal "Perlu validasi pengawas". Pengawas dapat meninjau, menyetujui, atau menolak rekomendasi tersebut. Klik tombol "Jadikan Rencana Pendampingan" untuk langsung menjadwalkan program supervisi di sekolah.',
    },
    {
      title: '5. Monitoring dan Evaluasi Tindak Lanjut',
      icon: CalendarClock,
      desc: 'Catat kemajuan kegiatan pendampingan di menu Monitoring. Status pelaksanaan tidak otomatis berubah menjadi selesai hanya karena tanggal telah lewat. Pengawas menetapkan status "Selesai" berdasarkan bukti dukung nyata (seperti notula Kombel, foto kegiatan, atau modul perbaikan).',
    },
    {
      title: '6. Generator Laporan Resmi & Ekspor',
      icon: Printer,
      desc: 'Sistem menyediakan 5 jenis laporan resmi: Laporan Individual Sekolah, Rekapitulasi 12 SD, Rekapitulasi 5 TK, Laporan Keseluruhan 17 Sekolah, dan Laporan Rencana Kerja. Dokumen dapat dicetak ke PDF atau diunduh dalam format Microsoft Word (.doc) dan Excel (.xlsx).',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Panduan Penggunaan SI-Analisis Rapor Pendidikan
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Petunjuk teknis operasional bagi Pengawas Sekolah Jenjang SD dan TK di lingkungan Dinas Pendidikan dan Kebudayaan Kota Pontianak.
        </p>
      </div>

      {/* Etika AI Notice */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0F2A4A] text-white p-5 rounded-2xl shadow-md space-y-2 text-xs">
        <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Kaidah Etika Pemanfaatan AI dalam Pengawasan Sekolah
        </h3>
        <p className="text-slate-200 leading-relaxed text-justify">
          Rekomendasi dan sintesis yang dihasilkan oleh kecerdasan buatan (Gemini AI) merupakan{' '}
          <strong>bahan pertimbangan awal</strong> untuk mempermudah telaah pengawas sekolah. Keputusan intervensi,
          evaluasi kinerja, dan arahan pembinaan tetap menjadi wewenang dan tanggung jawab penuh Pengawas Sekolah
          setelah melakukan verifikasi lapangan, telaah dokumen pendukung, dan dialog reflektif bersama Kepala Sekolah.
        </p>
      </div>

      {/* Step by Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">{g.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">{g.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Support Contact */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-center">
        <p className="font-bold text-slate-800">Dinas Pendidikan dan Kebudayaan Kota Pontianak</p>
        <p className="mt-0.5">Bidang Pembinaan Sekolah Dasar & PAUD • Sub Bagian Pengawasan Satuan Pendidikan</p>
        <p className="text-[11px] text-slate-400 mt-1">SI-ANALISIS RAPOR PENDIDIKAN PONTIANAK • Versi Produksi 1.0.0</p>
      </div>
    </div>
  );
};
