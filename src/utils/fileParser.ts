import * as XLSX from 'xlsx';
import { RaporRecord, Jenjang, ArahPerubahan } from '../types';
import { calculateArahPerubahan } from './analysisEngine';

export interface ParsedSheet {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ColumnMapping {
  kodeIndikator: string;
  namaIndikator: string;
  dimensi?: string;
  nilaiCapaian?: string;
  kategoriCapaian?: string;
  nilaiTahunLalu?: string;
  kategoriTahunLalu?: string;
  perubahan?: string;
  satuan?: string;
  deskripsi?: string;
  akarMasalah?: string;
  rekomendasi?: string;
}

export interface ValidationResult {
  validRecords: RaporRecord[];
  invalidRows: Array<{
    rowIndex: number;
    data: any;
    errors: string[];
  }>;
  warnings: string[];
}

/**
 * Membaca file binary (XLSX, XLS, CSV) dan mengekstrak sheets serta baris data
 */
export async function parseSpreadsheetFile(file: File): Promise<{
  sheets: ParsedSheet[];
  fileName: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

        const sheets: ParsedSheet[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Gunakan header: 1 untuk membaca baris pertama sebagai header asli
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            blankrows: false,
          });

          const headers: string[] = rawJson.length > 0 ? Object.keys(rawJson[0]) : [];

          return {
            sheetName,
            headers,
            rows: rawJson,
            totalRows: rawJson.length,
          };
        });

        resolve({
          sheets,
          fileName: file.name,
        });
      } catch (err) {
        reject(new Error('Format file tidak didukung atau berkas rusak. Pastikan file Excel/CSV valid.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas dari perangkat Anda.'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Deteksi pemetaan kolom otomatis secara cerdas berbasis sinonim umum Rapor Pendidikan
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    kodeIndikator: '',
    namaIndikator: '',
  };

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  headers.forEach((h) => {
    const norm = normalize(h);

    if (!mapping.kodeIndikator && (norm.includes('kode') || norm === 'id' || norm === 'noindikator')) {
      mapping.kodeIndikator = h;
    } else if (
      !mapping.namaIndikator &&
      (norm.includes('indikator') || norm.includes('namaindikator') || norm.includes('aspek'))
    ) {
      mapping.namaIndikator = h;
    } else if (!mapping.dimensi && (norm.includes('dimensi') || norm.includes('bidang'))) {
      mapping.dimensi = h;
    } else if (
      !mapping.nilaiCapaian &&
      (norm.includes('capaian') || norm.includes('nilai') || norm.includes('skor') || norm === 'skor2024')
    ) {
      mapping.nilaiCapaian = h;
    } else if (
      !mapping.kategoriCapaian &&
      (norm.includes('kategori') || norm.includes('predikat') || norm.includes('peringkat'))
    ) {
      mapping.kategoriCapaian = h;
    } else if (
      !mapping.nilaiTahunLalu &&
      (norm.includes('tahunlalu') || norm.includes('sebelumnya') || norm.includes('2023') || norm.includes('skor2023'))
    ) {
      mapping.nilaiTahunLalu = h;
    } else if (
      !mapping.perubahan &&
      (norm.includes('perubahan') || norm.includes('delta') || norm.includes('selisih'))
    ) {
      mapping.perubahan = h;
    } else if (!mapping.satuan && (norm.includes('satuan') || norm.includes('unit'))) {
      mapping.satuan = h;
    } else if (
      !mapping.deskripsi &&
      (norm.includes('deskripsi') || norm.includes('arti') || norm.includes('keterangan'))
    ) {
      mapping.deskripsi = h;
    } else if (
      !mapping.akarMasalah &&
      (norm.includes('akarmasalah') || norm.includes('masalah') || norm.includes('akar'))
    ) {
      mapping.akarMasalah = h;
    } else if (
      !mapping.rekomendasi &&
      (norm.includes('rekomendasi') || norm.includes('saran') || norm.includes('tindaklanjut'))
    ) {
      mapping.rekomendasi = h;
    }
  });

  // Fallbacks jika nama kolom pertama adalah kode dan kedua adalah nama
  if (!mapping.kodeIndikator && headers.length > 0) mapping.kodeIndikator = headers[0];
  if (!mapping.namaIndikator && headers.length > 1) mapping.namaIndikator = headers[1];

  return mapping;
}

/**
 * Validasi dan transformasikan data baris hasil impor menjadi RaporRecord resmi
 */
export function validateAndTransformRows(
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  schoolId: string,
  schoolName: string,
  npsn: string,
  jenjang: Jenjang,
  tahun: number,
  fileName: string
): ValidationResult {
  const validRecords: RaporRecord[] = [];
  const invalidRows: ValidationResult['invalidRows'] = [];
  const warnings: string[] = [];
  const seenCodes = new Set<string>();

  rows.forEach((row, index) => {
    const rowErrors: string[] = [];

    const rawKode = String(row[mapping.kodeIndikator] ?? '').trim();
    const rawNama = String(row[mapping.namaIndikator] ?? '').trim();

    if (!rawKode) {
      rowErrors.push('Kode indikator kosong atau tidak ditemukan pada kolom yang dipetakan.');
    }
    if (!rawNama) {
      rowErrors.push('Nama indikator kosong.');
    }

    if (seenCodes.has(rawKode)) {
      rowErrors.push(`Baris duplikat terdeteksi untuk kode indikator: "${rawKode}".`);
    } else if (rawKode) {
      seenCodes.add(rawKode);
    }

    // Parse Capaian
    let nilaiCapaian: number | null = null;
    if (mapping.nilaiCapaian && row[mapping.nilaiCapaian] !== undefined && row[mapping.nilaiCapaian] !== '') {
      const parsed = parseFloat(String(row[mapping.nilaiCapaian]).replace(',', '.'));
      if (!isNaN(parsed)) {
        nilaiCapaian = parsed;
      } else {
        warnings.push(`Baris ${index + 1}: Nilai capaian "${row[mapping.nilaiCapaian]}" tidak dapat diubah ke angka, disimpan sebagai teks/kategori.`);
      }
    }

    // Parse Nilai Tahun Lalu
    let nilaiTahunLalu: number | null = null;
    if (mapping.nilaiTahunLalu && row[mapping.nilaiTahunLalu] !== undefined && row[mapping.nilaiTahunLalu] !== '') {
      const parsed = parseFloat(String(row[mapping.nilaiTahunLalu]).replace(',', '.'));
      if (!isNaN(parsed)) {
        nilaiTahunLalu = parsed;
      }
    }

    // Perhitungan arah perubahan deterministik
    const perubahanCalc = calculateArahPerubahan(nilaiCapaian, nilaiTahunLalu);

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowIndex: index + 1,
        data: row,
        errors: rowErrors,
      });
    } else {
      const record: RaporRecord = {
        id: `rec-${schoolId}-${tahun}-${rawKode.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}`,
        schoolId,
        namaSekolah: schoolName,
        npsn,
        jenjang,
        tahun,
        kodeIndikator: rawKode,
        namaIndikator: rawNama,
        dimensi: mapping.dimensi ? String(row[mapping.dimensi] || 'Dimensi Utama') : 'Dimensi Rapor',
        nilaiCapaian,
        kategoriCapaian: mapping.kategoriCapaian ? String(row[mapping.kategoriCapaian] || '').trim() || null : null,
        nilaiTahunLalu,
        kategoriTahunLalu: mapping.kategoriTahunLalu ? String(row[mapping.kategoriTahunLalu] || '').trim() || null : null,
        perubahan: perubahanCalc.delta,
        arahPerubahan: perubahanCalc.arah,
        satuan: mapping.satuan ? String(row[mapping.satuan] || 'Skor') : 'Skor (1-100)',
        deskripsi: mapping.deskripsi ? String(row[mapping.deskripsi] || '') : '',
        akarMasalahSumber: mapping.akarMasalah ? String(row[mapping.akarMasalah] || '') : undefined,
        rekomendasiSumber: mapping.rekomendasi ? String(row[mapping.rekomendasi] || '') : undefined,
        dokumenSumber: fileName,
        tanggalImpor: new Date().toISOString(),
        isDemo: false,
      };

      validRecords.push(record);
    }
  });

  return {
    validRecords,
    invalidRows,
    warnings,
  };
}
