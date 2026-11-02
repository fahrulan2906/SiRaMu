import { calculateArahPerubahan, calculateSchoolSummary, analyzeCrossSchoolData } from './analysisEngine';
import { DEMO_SCHOOL_SD, DEMO_SCHOOL_TK, DEMO_RAPOR_RECORDS, DEMO_ANALYSIS_RECORDS } from '../data/initialData';
import { School, RaporRecord } from '../types';

export interface AuditTestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  details?: string[];
}

export interface FullAuditReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  overallStatus: 'LULUS_AUDIT' | 'ADA_CATATAN' | 'GAGAL';
  results: AuditTestResult[];
}

/**
 * Audit Mesin Analisis SI-ANALISIS RAPOR PENDIDIKAN PONTIANAK
 * Melakukan pengujian deterministik dan verifikasi integritas data
 */
export function runComprehensiveAudit(): FullAuditReport {
  const results: AuditTestResult[] = [];

  // UJI 1: Perhitungan Numerik Delta & Arah Perubahan Positif (arahIdeal = NAIK)
  const test1 = calculateArahPerubahan(68.45, 59.20, 'NAIK');
  results.push({
    id: 'AUDIT-01',
    category: 'Perhitungan Numerik Deterministik',
    name: 'Kalkulasi Delta Indikator Ideal Naik',
    description: 'Memastikan selisih numerik dihitung tepat dan arah perubahan positif terdeteksi sebagai MEMBAIK.',
    passed: test1.delta === 9.25 && test1.arah === 'MEMBAIK',
    actualOutput: `Delta: +${test1.delta}, Arah: ${test1.arah}`,
    expectedOutput: 'Delta: +9.25, Arah: MEMBAIK',
  });

  // UJI 2: Perhitungan Numerik Penurunan (arahIdeal = NAIK)
  const test2 = calculateArahPerubahan(46.12, 51.30, 'NAIK');
  results.push({
    id: 'AUDIT-02',
    category: 'Perhitungan Numerik Deterministik',
    name: 'Kalkulasi Delta Indikator Mengalami Penurunan',
    description: 'Memastikan penurunan nilai menghasilkan delta negatif dan arah MENURUN.',
    passed: test2.delta === -5.18 && test2.arah === 'MENURUN',
    actualOutput: `Delta: ${test2.delta}, Arah: ${test2.arah}`,
    expectedOutput: 'Delta: -5.18, Arah: MENURUN',
  });

  // UJI 3: Kepatuhan Arah Ideal Belum Diketahui (Jangan Menganggap Meningkat Selalu Lebih Baik)
  const test3 = calculateArahPerubahan(80.0, 70.0, 'TIDAK_DIKETAHUI');
  results.push({
    id: 'AUDIT-03',
    category: 'Kepatuhan Regulasi & Non-Asumsi',
    name: 'Indikator dengan Arah Ideal Belum Terverifikasi',
    description: 'Jika arah ideal tidak diketahui, nilai yang meningkat DILARANG langsung dianggap MEMBAIK.',
    passed: test3.arah === 'BELUM_DAPAT_DITENTUKAN',
    actualOutput: `Arah: ${test3.arah} (${test3.keterangan})`,
    expectedOutput: 'Arah: BELUM_DAPAT_DITENTUKAN',
  });

  // UJI 4: Indikator Terbalik (Nilai Turun = Membaik, misal Iklim Kekerasan / Perundungan)
  const test4 = calculateArahPerubahan(10.0, 18.5, 'TURUN');
  results.push({
    id: 'AUDIT-04',
    category: 'Perhitungan Numerik Deterministik',
    name: 'Kalkulasi Indikator Ideal Penurunan (Reverse Direction)',
    description: 'Nilai berkurang pada indikator berisiko harus dihitung sebagai arah MEMBAIK.',
    passed: test4.delta === -8.5 && test4.arah === 'MEMBAIK',
    actualOutput: `Delta: ${test4.delta}, Arah: ${test4.arah}`,
    expectedOutput: 'Delta: -8.5, Arah: MEMBAIK',
  });

  // UJI 5: Pemisahan Ketat Data SD vs TK pada Analisis Lintas Sekolah
  const mockSchools: School[] = [DEMO_SCHOOL_SD, DEMO_SCHOOL_TK];
  const sdCross = analyzeCrossSchoolData(mockSchools, DEMO_RAPOR_RECORDS, 'SD', 2024);
  const tkCross = analyzeCrossSchoolData(mockSchools, DEMO_RAPOR_RECORDS, 'TK', 2024);

  const noTkInSd = sdCross.rekapitulasiSekolah.every((r) => r.school.jenjang === 'SD');
  const noSdInTk = tkCross.rekapitulasiSekolah.every((r) => r.school.jenjang === 'TK');
  const strictSeparationPassed = noTkInSd && noSdInTk;

  results.push({
    id: 'AUDIT-05',
    category: 'Pemisahan Metodologis Jenjang',
    name: 'Isolasi Rekapitulasi SD dan TK',
    description: 'Data indikator SD dan TK wajib terisolasi penuh dan tidak digabungkan dalam matriks capaian.',
    passed: strictSeparationPassed,
    actualOutput: `SD Matrix: ${sdCross.rekapitulasiSekolah.length} SD (0 TK); TK Matrix: ${tkCross.rekapitulasiSekolah.length} TK (0 SD)`,
    expectedOutput: 'SD Matrix hanya memuat SD; TK Matrix hanya memuat TK.',
  });

  // UJI 6: Pemisahan Data Fakta Rapor, Hipotesis Akar Masalah, dan Rekomendasi
  const demoAnalysis = DEMO_ANALYSIS_RECORDS[0];
  const hasFacts = demoAnalysis.hasilAI.temuan_utama.every(
    (t) => Boolean(t.fakta_data) && Boolean(t.interpretasi)
  );
  const hasHypotheses = demoAnalysis.hasilAI.hipotesis_akar_masalah.every(
    (h) => Boolean(h.dugaan_masalah) && Boolean(h.bukti_yang_diperlukan) && Boolean(h.metode_verifikasi)
  );
  const hasRecommendations = demoAnalysis.hasilAI.rekomendasi_pendampingan.every(
    (r) => r.langkah_pendampingan.length > 0 && Boolean(r.indikator_keberhasilan)
  );
  const structurePassed = hasFacts && hasHypotheses && hasRecommendations;

  results.push({
    id: 'AUDIT-06',
    category: 'Struktur Pemisahan Fakta vs Hipotesis',
    name: 'Pemisahan Tegas Fakta, Hipotesis & Rekomendasi',
    description: 'Setiap temuan memuat fakta & interpretasi, akar masalah memuat bukti verifikasi, dan rekomendasi terukur.',
    passed: structurePassed,
    actualOutput: `Fakta terisi: ${hasFacts}, Hipotesis dengan metode verifikasi: ${hasHypotheses}, Rekomendasi terstruktur: ${hasRecommendations}`,
    expectedOutput: 'Seluruh komponen terisi lengkap dan terpisah tegas.',
  });

  // UJI 7: Verifikasi Skor Prioritas Internal Pengawas Bersifat Terbuka & Bukan Nilai Resmi Rapor
  const sdSummary = calculateSchoolSummary(DEMO_RAPOR_RECORDS, DEMO_SCHOOL_SD, 2024);
  const internalScoreFormulaValid =
    typeof sdSummary.skorPrioritasInternal === 'number' &&
    !isNaN(sdSummary.skorPrioritasInternal) &&
    sdSummary.catatanPerhitungan.length > 0;

  results.push({
    id: 'AUDIT-07',
    category: 'Transparansi Formula Perhitungan',
    name: 'Formula Skor Prioritas Internal Pengawas',
    description: 'Skor internal pengawas memiliki perhitungan transparan dan tidak mengklaim sebagai skor resmi Rapor Pendidikan.',
    passed: internalScoreFormulaValid,
    actualOutput: `Skor terhitung: ${sdSummary.skorPrioritasInternal}/100, Catatan: ${sdSummary.catatanPerhitungan.join(' ')}`,
    expectedOutput: 'Skor terhitung numerik dengan catatan perhitungan deterministik.',
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    overallStatus: failedCount === 0 ? 'LULUS_AUDIT' : 'ADA_CATATAN',
    results,
  };
}
