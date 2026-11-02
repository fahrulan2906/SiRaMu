import { RaporRecord, IndicatorDefinition, ArahPerubahan, School, Jenjang } from '../types';
import { INDICATOR_DICTIONARY } from '../data/initialData';

export interface SchoolDeterministicSummary {
  schoolId: string;
  namaSekolah: string;
  jenjang: Jenjang;
  tahun: number;
  totalIndikator: number;
  membaik: number;
  menurun: number;
  tetap: number;
  belumDapatDibandingkan: number;
  indikatorPrioritas: RaporRecord[];
  kekuatanSekolah: RaporRecord[];
  rataRataSkor: number | null;
  skorPrioritasInternal: number;
  catatanPerhitungan: string[];
}

export function findIndicatorDefinition(kode: string, jenjang: Jenjang): IndicatorDefinition | undefined {
  return INDICATOR_DICTIONARY.find(
    (def) => def.kode === kode && def.jenjang === jenjang
  );
}

/**
 * Menghitung arah perubahan secara deterministik dan objektif
 * Memperhatikan arah ideal (NAIK vs TURUN) serta ketersediaan data pembanding
 */
export function calculateArahPerubahan(
  nilaiSekarang: number | null,
  nilaiLalu: number | null,
  arahIdeal: 'NAIK' | 'TURUN' | 'TIDAK_DIKETAHUI' = 'NAIK'
): { delta: number | null; arah: ArahPerubahan; keterangan: string } {
  if (nilaiSekarang === null || nilaiLalu === null || isNaN(nilaiSekarang) || isNaN(nilaiLalu)) {
    return {
      delta: null,
      arah: 'BELUM_DAPAT_DITENTUKAN',
      keterangan: 'Data pembanding tahun sebelumnya belum tersedia atau satuan tidak sepadan.',
    };
  }

  const delta = Number((nilaiSekarang - nilaiLalu).toFixed(2));

  if (Math.abs(delta) < 0.05) {
    return {
      delta: 0,
      arah: 'TIDAK_BERUBAH',
      keterangan: 'Capaian relatif stabil (selisih di bawah ambang 0.05 poin).',
    };
  }

  // Jika arah perubahan indikator belum diketahui secara resmi, JANGAN menganggap nilai meningkat selalu lebih baik
  if (arahIdeal === 'TIDAK_DIKETAHUI') {
    return {
      delta,
      arah: 'BELUM_DAPAT_DITENTUKAN',
      keterangan: `Arah perubahan belum dapat ditentukan secara resmi (tercatat selisih ${delta > 0 ? '+' : ''}${delta} poin). Karakteristik ideal indikator perlu verifikasi pedoman instansi.`,
    };
  }

  if (arahIdeal === 'NAIK') {
    if (delta > 0) {
      return {
        delta,
        arah: 'MEMBAIK',
        keterangan: `Meningkat sebesar +${delta} poin dari tahun sebelumnya (perkembangan positif).`,
      };
    } else {
      return {
        delta,
        arah: 'MENURUN',
        keterangan: `Mengalami penurunan sebesar ${delta} poin dari tahun sebelumnya (perlu atensi).`,
      };
    }
  } else {
    // Jika indikator idealnya turun (misal angka kekerasan/perundungan)
    if (delta < 0) {
      return {
        delta,
        arah: 'MEMBAIK',
        keterangan: `Menurun sebesar ${delta} poin (arah positif sesuai karakteristik indikator).`,
      };
    } else {
      return {
        delta,
        arah: 'MENURUN',
        keterangan: `Meningkat sebesar +${delta} poin (kondisi berisiko, perlu perhatian khusus).`,
      };
    }
  }
}

/**
 * Menentukan apakah sebuah indikator masuk prioritas perbaikan
 * berdasarkan kategori resmi dan penurunan angka
 */
export function isPriorityIndicator(record: RaporRecord): boolean {
  const kat = (record.kategoriCapaian || '').toLowerCase();
  
  // Kategori resmi Dikdas & PAUD yang menunjukkan perlunya atensi
  const isKategoriKritis =
    kat.includes('perlu intervensi') ||
    kat.includes('kurang') ||
    kat.includes('perlu ditingkatkan') ||
    kat.includes('perlu bimbingan') ||
    kat.includes('perlu dibangun') ||
    kat.includes('perlu perbaikan') ||
    kat.includes('dasar') ||
    kat.includes('waspada') ||
    kat.includes('mulai muncul');

  const isMenurun = record.arahPerubahan === 'MENURUN';

  return isKategoriKritis || isMenurun;
}

/**
 * Menentukan apakah indikator mencerminkan kekuatan satuan pendidikan
 */
export function isStrengthIndicator(record: RaporRecord): boolean {
  const kat = (record.kategoriCapaian || '').toLowerCase();
  
  const isKategoriUnggul =
    kat.includes('mahir') ||
    kat.includes('cakap') ||
    kat.includes('membudaya') ||
    kat.includes('berkembang') ||
    kat.includes('aman') ||
    kat.includes('sangat baik') ||
    kat.includes('sangat layak') ||
    kat.includes('optimal') ||
    kat.includes('aktif') ||
    kat.includes('tinggi');

  const isMembaik = record.arahPerubahan === 'MEMBAIK';

  return isKategoriUnggul || (isMembaik && (record.nilaiCapaian ?? 0) >= 60);
}

/**
 * Menghitung ringkasan capaian deterministik sebuah sekolah pada suatu tahun
 */
export function calculateSchoolSummary(
  records: RaporRecord[],
  school: School,
  tahun: number
): SchoolDeterministicSummary {
  const schoolRecords = records.filter(
    (r) => r.schoolId === school.id && r.tahun === tahun
  );

  let membaik = 0;
  let menurun = 0;
  let tetap = 0;
  let belumDapatDibandingkan = 0;
  let totalSkor = 0;
  let countSkor = 0;

  const indikatorPrioritas: RaporRecord[] = [];
  const kekuatanSekolah: RaporRecord[] = [];

  schoolRecords.forEach((rec) => {
    if (rec.nilaiCapaian !== null && !isNaN(rec.nilaiCapaian)) {
      totalSkor += rec.nilaiCapaian;
      countSkor++;
    }

    if (rec.arahPerubahan === 'MEMBAIK') membaik++;
    else if (rec.arahPerubahan === 'MENURUN') menurun++;
    else if (rec.arahPerubahan === 'TIDAK_BERUBAH') tetap++;
    else belumDapatDibandingkan++;

    if (isPriorityIndicator(rec)) {
      indikatorPrioritas.push(rec);
    }
    if (isStrengthIndicator(rec)) {
      kekuatanSekolah.push(rec);
    }
  });

  const rataRataSkor = countSkor > 0 ? Number((totalSkor / countSkor).toFixed(2)) : null;

  // Rumus Skor Prioritas Internal Pengawas (Opsional & Berlabel Jelas)
  // Bobot: Rendahnya rata-rata skor (40%) + Rasio indikator menurun (40%) + Rasio prioritas (20%)
  const total = schoolRecords.length;
  let skorPrioritasInternal = 0;
  if (total > 0) {
    const avgFactor = rataRataSkor !== null ? Math.max(0, 100 - rataRataSkor) : 50;
    const declineFactor = (menurun / total) * 100;
    const prioFactor = (indikatorPrioritas.length / total) * 100;
    skorPrioritasInternal = Number((avgFactor * 0.4 + declineFactor * 0.4 + prioFactor * 0.2).toFixed(1));
  }

  const catatanPerhitungan = [
    `Total indikator terproses: ${total}.`,
    `Indikator membaik: ${membaik}, menurun: ${menurun}, stabil: ${tetap}.`,
    belumDapatDibandingkan > 0
      ? `Terdapat ${belumDapatDibandingkan} indikator yang belum memiliki data pembanding tahun lalu.`
      : 'Semua indikator memiliki data pembanding tahun sebelumnya.',
  ];

  return {
    schoolId: school.id,
    namaSekolah: school.nama,
    jenjang: school.jenjang,
    tahun,
    totalIndikator: total,
    membaik,
    menurun,
    tetap,
    belumDapatDibandingkan,
    indikatorPrioritas,
    kekuatanSekolah,
    rataRataSkor,
    skorPrioritasInternal,
    catatanPerhitungan,
  };
}

/**
 * Analisis Lintas Sekolah Terpisah untuk SD atau TK
 */
export interface CrossSchoolTheme {
  tema: string;
  kodeIndikator: string;
  namaIndikator: string;
  jenjang: Jenjang;
  jumlahSekolahTerdampak: number;
  daftarSekolah: string[];
  rekomendasiBentukKegiatan: string;
}

export interface BestPracticeSource {
  schoolId: string;
  namaSekolah: string;
  jenjang: Jenjang;
  kodeIndikator: string;
  namaIndikator: string;
  nilaiCapaian: number;
  kategoriCapaian: string;
  alasanPraktikBaik: string;
}

export function analyzeCrossSchoolData(
  schools: School[],
  records: RaporRecord[],
  targetJenjang: Jenjang,
  tahun: number
): {
  rekapitulasiSekolah: Array<{
    school: School;
    summary: SchoolDeterministicSummary;
    hasData: boolean;
  }>;
  matrixIndikator: Record<string, Record<string, RaporRecord | undefined>>;
  daftarIndikatorTersedia: IndicatorDefinition[];
  temaPendampinganBersama: CrossSchoolTheme[];
  sumberPraktikBaik: BestPracticeSource[];
} {
  const filteredSchools = schools.filter((s) => s.jenjang === targetJenjang);
  const targetRecords = records.filter(
    (r) => r.jenjang === targetJenjang && r.tahun === tahun
  );

  const rekapitulasiSekolah = filteredSchools.map((school) => {
    const summary = calculateSchoolSummary(targetRecords, school, tahun);
    return {
      school,
      summary,
      hasData: summary.totalIndikator > 0,
    };
  });

  // Susun matriks indikator: [kodeIndikator][schoolId] => RaporRecord
  const matrixIndikator: Record<string, Record<string, RaporRecord | undefined>> = {};
  const indikatorMap = new Map<string, IndicatorDefinition>();

  targetRecords.forEach((rec) => {
    if (!matrixIndikator[rec.kodeIndikator]) {
      matrixIndikator[rec.kodeIndikator] = {};
    }
    matrixIndikator[rec.kodeIndikator][rec.schoolId] = rec;

    if (!indikatorMap.has(rec.kodeIndikator)) {
      const def = findIndicatorDefinition(rec.kodeIndikator, targetJenjang) || {
        kode: rec.kodeIndikator,
        nama: rec.namaIndikator,
        dimensi: rec.dimensi,
        jenjang: targetJenjang,
        definisi: rec.deskripsi || 'Definisi indikator dokumen rapor',
        satuan: rec.satuan || 'Skor',
        arahIdeal: 'NAIK',
        rentangNilai: '1 - 100',
        kategoriResmi: [],
        sumberDefinisi: rec.dokumenSumber,
        sebandingAntartahun: true,
      };
      indikatorMap.set(rec.kodeIndikator, def);
    }
  });

  // Identifikasi tema pendampingan bersama (kelompok sekolah dengan masalah sama)
  const temaPendampinganBersama: CrossSchoolTheme[] = [];
  const sumberPraktikBaik: BestPracticeSource[] = [];

  indikatorMap.forEach((def, kode) => {
    const schoolsWithProblem: string[] = [];

    rekapitulasiSekolah.forEach(({ school, summary }) => {
      const rec = matrixIndikator[kode]?.[school.id];
      if (rec && isPriorityIndicator(rec)) {
        schoolsWithProblem.push(school.nama);
      }

      // Cari sekolah unggul untuk praktik baik
      if (rec && rec.nilaiCapaian !== null && rec.nilaiCapaian >= 68 && isStrengthIndicator(rec)) {
        sumberPraktikBaik.push({
          schoolId: school.id,
          namaSekolah: school.nama,
          jenjang: targetJenjang,
          kodeIndikator: kode,
          namaIndikator: def.nama,
          nilaiCapaian: rec.nilaiCapaian,
          kategoriCapaian: rec.kategoriCapaian || 'Tinggi',
          alasanPraktikBaik: `Memiliki capaian ${rec.nilaiCapaian} (${rec.kategoriCapaian || 'Optimal'}) dan arah perkembangan positif.`,
        });
      }
    });

    if (schoolsWithProblem.length >= 2) {
      temaPendampinganBersama.push({
        tema: `Penguatan Bersama: ${def.nama}`,
        kodeIndikator: kode,
        namaIndikator: def.nama,
        jenjang: targetJenjang,
        jumlahSekolahTerdampak: schoolsWithProblem.length,
        daftarSekolah: schoolsWithProblem,
        rekomendasiBentukKegiatan:
          targetJenjang === 'SD'
            ? 'Lokakarya Bersama Gugus / KKG Mini Pengawas Binaan'
            : 'Workshop Tematik Bersama IGTKI / Gugus PAUD Binaan',
      });
    }
  });

  return {
    rekapitulasiSekolah,
    matrixIndikator,
    daftarIndikatorTersedia: Array.from(indikatorMap.values()),
    temaPendampinganBersama,
    sumberPraktikBaik,
  };
}
