export type Jenjang = 'SD' | 'TK';

export type KecamatanPontianak =
  | 'Pontianak Barat'
  | 'Pontianak Kota'
  | 'Pontianak Selatan'
  | 'Pontianak Tenggara'
  | 'Pontianak Timur'
  | 'Pontianak Utara';

export interface School {
  id: string;
  npsn: string;
  nama: string;
  jenjang: Jenjang;
  kecamatan: KecamatanPontianak;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah?: string;
  isVerified: boolean; // false for default 17 sample names ("Data contoh belum diverifikasi")
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ArahPerubahan =
  | 'MEMBAIK'
  | 'MENURUN'
  | 'TIDAK_BERUBAH'
  | 'BELUM_DAPAT_DITENTUKAN';

export interface IndicatorDefinition {
  kode: string;
  nama: string;
  dimensi: string;
  jenjang: Jenjang;
  definisi: string;
  satuan: string;
  arahIdeal: 'NAIK' | 'TURUN' | 'TIDAK_DIKETAHUI'; // Apakah nilai lebih tinggi berarti lebih baik
  rentangNilai: string;
  kategoriResmi: string[];
  sumberDefinisi: string;
  sebandingAntartahun: boolean;
}

export interface RaporRecord {
  id: string;
  schoolId: string;
  npsn: string;
  namaSekolah: string;
  jenjang: Jenjang;
  tahun: number;
  kodeIndikator: string;
  namaIndikator: string;
  dimensi: string;
  definisi?: string;
  nilaiCapaian: number | null;
  kategoriCapaian: string | null;
  nilaiTahunLalu: number | null;
  kategoriTahunLalu: string | null;
  perubahan: number | null;
  arahPerubahan: ArahPerubahan;
  satuan: string;
  deskripsi: string;
  akarMasalahSumber?: string;
  rekomendasiSumber?: string;
  dokumenSumber: string;
  tanggalImpor: string;
  isDemo: boolean;
}

export interface AIFinding {
  kode_indikator: string;
  nama_indikator: string;
  nilai_asli?: string | number | null;
  tahun_data?: number;
  dokumen_sumber?: string;
  fakta_data: string;
  interpretasi: string;
  dasar_interpretasi?: string;
  status_bukti: string;
  tingkat_prioritas: 'Tinggi' | 'Sedang' | 'Rendah' | string;
  alasan_prioritas: string;
  keterbatasan_analisis: string;
}

export interface AIRootCause {
  dugaan_masalah: string;
  dasar_dugaan: string;
  bukti_yang_diperlukan: string;
  metode_verifikasi: string;
  status_hipotesis?: string;
}

export interface AICoachingRecommendation {
  id?: string;
  indikator_terkait: string;
  tujuan_perbaikan: string;
  langkah_pendampingan: string[];
  pihak_terlibat: string[];
  indikator_keberhasilan: string;
  bukti_dukung: string;
  jangka_waktu: string;
  status_rekomendasi: 'Perlu validasi pengawas' | 'Disetujui' | 'Ditolak';
}

export interface AIAnalysisOutput {
  ringkasan_eksekutif: string;
  kekuatan_sekolah: string[];
  temuan_utama: AIFinding[];
  hipotesis_akar_masalah: AIRootCause[];
  rekomendasi_pendampingan: AICoachingRecommendation[];
  data_yang_perlu_dilengkapi: string[];
  kesimpulan: string;
}

export interface AnalysisRecord {
  id: string;
  schoolId: string;
  namaSekolah: string;
  jenjang: Jenjang;
  tahun: number;
  waktuAnalisis: string;
  modelDigunakan: string;
  dokumenSumber: string;
  isDemo: boolean;
  statusValidasiPengawas: 'Belum Divalidasi' | 'Sebagian Divalidasi' | 'Divalidasi Lengkap';
  catatanPengawas?: string;
  
  // Deterministic summary
  totalIndikator: number;
  indikatorMembaik: number;
  indikatorMenurun: number;
  indikatorTetap: number;
  indikatorBelumDapatDibandingkan: number;
  skorPrioritasInternal?: number;
  
  // AI Output
  hasilAI: AIAnalysisOutput;
}

export type BentukKegiatanPendampingan =
  | 'Diskusi dengan kepala sekolah'
  | 'Pendampingan perencanaan berbasis data'
  | 'Refleksi bersama'
  | 'Analisis akar masalah'
  | 'Observasi pembelajaran'
  | 'Pendampingan guru'
  | 'Lokakarya'
  | 'Berbagi praktik baik'
  | 'Monitoring tindak lanjut'
  | 'Evaluasi perubahan capaian'
  | string;

export type StatusPelaksanaan =
  | 'Belum direncanakan'
  | 'Direncanakan'
  | 'Sedang dilaksanakan'
  | 'Menunggu evaluasi'
  | 'Selesai'
  | 'Perlu tindak lanjut';

export interface ActionPlan {
  id: string;
  schoolId: string;
  namaSekolah: string;
  jenjang: Jenjang;
  tahun: number;
  indikatorPrioritas: string;
  temuanUtama: string;
  tujuanPendampingan: string;
  bentukKegiatan: BentukKegiatanPendampingan;
  langkahKegiatan: string[];
  sasaran: string;
  pihakTerlibat: string[];
  jadwalPelaksanaan: string; // DD-MM-YYYY
  targetKeberhasilan: string;
  buktiDukung: string;
  penanggungJawab: string;
  status: StatusPelaksanaan;
  hasilEvaluasi?: string;
  catatanPengawas?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupervisorProfile {
  nama: string;
  nip: string;
  pangkatGolongan: string;
  instansi: string;
  kabupatenKota: string;
  provinsi: string;
  wilayahBinaan: string;
  nomorSK?: string;
}

export interface UploadBatch {
  id: string;
  namaFile: string;
  schoolId: string;
  namaSekolah: string;
  jenjang: Jenjang;
  tahun: number;
  tanggalUnggah: string;
  jumlahBaris: number;
  statusValidasi: 'Berhasil' | 'Peringatan' | 'Gagal';
  statusAnalisis: 'Sudah Dianalisis' | 'Belum Dianalisis';
}
