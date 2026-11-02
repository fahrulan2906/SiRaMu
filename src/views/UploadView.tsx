import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  parseSpreadsheetFile,
  autoDetectColumnMapping,
  validateAndTransformRows,
  ParsedSheet,
  ColumnMapping,
  ValidationResult,
} from '../utils/fileParser';
import { exportToXLSX } from '../utils/exportHelpers';
import { INDICATOR_DICTIONARY } from '../data/initialData';
import { Jenjang } from '../types';

export const UploadView: React.FC = () => {
  const {
    schools,
    selectedSchoolId,
    setSelectedSchoolId,
    importRaporRecords,
    setActiveTab,
    demoMode,
  } = useApp();

  // Wizard Steps: 1: School & File -> 2: Sheet & Mapping -> 3: Validation Preview -> 4: Complete
  const [step, setStep] = useState<number>(1);

  // Step 1 State
  const [targetSchoolId, setTargetSchoolId] = useState<string>(selectedSchoolId || '');
  const [targetTahun, setTargetTahun] = useState<number>(2024);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Step 2 State (Parsed File Data)
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    kodeIndikator: '',
    namaIndikator: '',
  });

  // Step 3 State (Validation)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [conflictMode, setConflictMode] = useState<'UPDATE' | 'ADD'>('UPDATE');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSchool = schools.find((s) => s.id === targetSchoolId);

  // Filter schools (omit demo if demo mode is off)
  const selectableSchools = schools.filter((s) => demoMode || !s.isDemo);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setIsProcessing(true);

    try {
      const parsed = await parseSpreadsheetFile(selectedFile);
      if (parsed.sheets.length === 0 || parsed.sheets[0].rows.length === 0) {
        throw new Error('File tidak berisi data atau lembar kerja kosong.');
      }

      setParsedSheets(parsed.sheets);
      setSelectedSheetIndex(0);

      // Auto-detect mapping on first sheet
      const initialHeaders = parsed.sheets[0].headers;
      const detected = autoDetectColumnMapping(initialHeaders);
      setColumnMapping(detected);

      setStep(2);
    } catch (err: any) {
      setParseError(err.message || 'Gagal memproses file. Pastikan berkas berformat .xlsx atau .csv');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetChange = (sheetIdx: number) => {
    setSelectedSheetIndex(sheetIdx);
    const headers = parsedSheets[sheetIdx].headers;
    const detected = autoDetectColumnMapping(headers);
    setColumnMapping(detected);
  };

  const handleValidate = () => {
    if (!selectedSchool || !file) return;

    const currentSheet = parsedSheets[selectedSheetIndex];
    if (!currentSheet) return;

    if (!columnMapping.kodeIndikator || !columnMapping.namaIndikator) {
      alert('Kolom "Kode Indikator" dan "Nama Indikator" wajib dipetakan.');
      return;
    }

    const result = validateAndTransformRows(
      currentSheet.rows,
      columnMapping,
      selectedSchool.id,
      selectedSchool.nama,
      selectedSchool.npsn,
      selectedSchool.jenjang,
      targetTahun,
      file.name
    );

    setValidationResult(result);
    setStep(3);
  };

  const handleConfirmImport = () => {
    if (!validationResult || !selectedSchool || !file) return;

    const success = importRaporRecords(
      validationResult.validRecords,
      conflictMode,
      {
        namaFile: file.name,
        schoolId: selectedSchool.id,
        namaSekolah: selectedSchool.nama,
        jenjang: selectedSchool.jenjang,
        tahun: targetTahun,
        jumlahBaris: validationResult.validRecords.length,
        statusValidasi: validationResult.invalidRows.length > 0 ? 'Peringatan' : 'Berhasil',
        statusAnalisis: 'Belum Dianalisis',
      }
    );

    if (success) {
      setSelectedSchoolId(selectedSchool.id);
      setStep(4);
    }
  };

  // Helper to generate sample template Excel for pengawas
  const handleDownloadTemplate = (jenjang: Jenjang) => {
    const relevantDict = INDICATOR_DICTIONARY.filter((ind) => ind.jenjang === jenjang);
    const templateRows = relevantDict.map((d) => ({
      'Kode Indikator': d.kode,
      'Nama Indikator': d.nama,
      Dimensi: d.dimensi,
      'Nilai Capaian': jenjang === 'SD' ? 65.5 : 72.0,
      'Kategori Capaian': jenjang === 'SD' ? 'Cakap' : 'Baik',
      'Nilai Tahun Lalu': jenjang === 'SD' ? 60.0 : 68.0,
      'Kategori Tahun Lalu': jenjang === 'SD' ? 'Cakap' : 'Baik',
      Satuan: d.satuan,
      Deskripsi: d.definisi,
      'Akar Masalah': 'Kebutuhan peningkatan variasi model pembelajaran',
      Rekomendasi: 'Penguatan komunitas belajar guru',
    }));

    exportToXLSX(
      templateRows,
      `Format_Unggah_Rapor_${jenjang}_Pontianak`,
      `Rapor_${jenjang}`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0F2A4A] flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          Modul Unggah & Validasi Rapor Pendidikan
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Impor dokumen resmi Rapor Pendidikan (format Excel .xlsx atau CSV) dengan sistem pemetaan kolom
          fleksibel, validasi data otomatis, dan pencegahan duplikasi.
        </p>

        {/* Step Indicator */}
        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
          {[
            { num: 1, title: '1. Pilih & Unggah' },
            { num: 2, title: '2. Pemetaan Kolom' },
            { num: 3, title: '3. Validasi & Pratinjau' },
            { num: 4, title: '4. Selesai' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                step === s.num
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-xs">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Select School, Year & File */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target School */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Satuan Pendidikan Binaan <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetSchoolId}
                onChange={(e) => setTargetSchoolId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:outline-blue-600 bg-white"
              >
                <option value="">-- Pilih Satuan Pendidikan --</option>
                {selectableSchools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    [{sch.jenjang}] {sch.nama} ({sch.kecamatan})
                  </option>
                ))}
              </select>
              {selectedSchool && (
                <p className="text-[11px] text-slate-500 mt-1">
                  NPSN: <span className="font-mono">{selectedSchool.npsn}</span> • Kepala Sekolah:{' '}
                  <span className="font-semibold">{selectedSchool.kepalaSekolah}</span>
                </p>
              )}
            </div>

            {/* Target Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tahun Rapor Pendidikan <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetTahun}
                onChange={(e) => setTargetTahun(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 border border-slate-300 rounded-xl focus:outline-blue-600 bg-white"
              >
                <option value={2026}>Tahun 2026</option>
                <option value={2025}>Tahun 2025</option>
                <option value={2024}>Tahun 2024 (Rapor Terkini)</option>
                <option value={2023}>Tahun 2023</option>
                <option value={2022}>Tahun 2022</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Tentukan periode evaluasi capaian yang tertera pada dokumen.
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Berkas Rapor Pendidikan (Excel / CSV) <span className="text-rose-500">*</span>
            </label>
            <div
              onClick={() => {
                if (!targetSchoolId) {
                  alert('Pilih satuan pendidikan binaan terlebih dahulu.');
                  return;
                }
                fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                targetSchoolId
                  ? 'border-blue-300 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/40'
                  : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={!targetSchoolId}
              />
              <FileSpreadsheet className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">
                Klik untuk memilih dokumen Rapor Pendidikan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (Comma Separated Values)
              </p>
              {file && (
                <p className="text-xs font-bold text-emerald-600 mt-3">
                  Berkas terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Template Download Help */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-800">Butuh Format Contoh?</p>
              <p className="text-slate-500">
                Unduh template Excel dengan struktur indikator standar Kemendikbudristek untuk SD atau TK.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownloadTemplate('SD')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded-lg font-bold text-blue-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Template SD
              </button>
              <button
                onClick={() => handleDownloadTemplate('TK')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg font-bold text-emerald-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Template TK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Sheet Selector & Column Mapping */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2A4A]">
                Pilih Lembar Kerja & Pemetaan Kolom
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan nama kolom pada file Excel Anda dengan struktur data aplikasi.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
              {file?.name}
            </span>
          </div>

          {/* Sheet Selector (If multiple sheets exist) */}
          {parsedSheets.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Lembar Kerja (Worksheet)
              </label>
              <div className="flex flex-wrap gap-2">
                {parsedSheets.map((sh, idx) => (
                  <button
                    key={sh.sheetName}
                    onClick={() => handleSheetChange(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedSheetIndex === idx
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sh.sheetName} ({sh.totalRows} Baris)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mapping Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pemetaan Kolom Aplikasi &larr; Kolom Dokumen Anda
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mandatory: Kode Indikator */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30">
                <label className="block text-xs font-bold text-blue-950 mb-1">
                  Kode Indikator <span className="text-rose-500">* (Wajib)</span>
                </label>
                <select
                  value={columnMapping.kodeIndikator}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, kodeIndikator: e.target.value })
                  }
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Kolom File --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Misal: "A.1", "A.2", "D.1", "Kode"</p>
              </div>

              {/* Mandatory: Nama Indikator */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30">
                <label className="block text-xs font-bold text-blue-950 mb-1">
                  Nama Indikator <span className="text-rose-500">* (Wajib)</span>
                </label>
                <select
                  value={columnMapping.namaIndikator}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, namaIndikator: e.target.value })
                  }
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Kolom File --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Misal: "Kemampuan Literasi", "Indikator"</p>
              </div>

              {/* Nilai Capaian */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai Capaian / Skor
                </label>
                <select
                  value={columnMapping.nilaiCapaian || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, nilaiCapaian: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategori Capaian */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori / Predikat Capaian
                </label>
                <select
                  value={columnMapping.kategoriCapaian || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, kategoriCapaian: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nilai Tahun Lalu */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nilai Capaian Tahun Sebelumnya
                </label>
                <select
                  value={columnMapping.nilaiTahunLalu || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, nilaiTahunLalu: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensi */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dimensi / Kelompok Indikator
                </label>
                <select
                  value={columnMapping.dimensi || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, dimensi: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Akar Masalah */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Akar Masalah (Tercantum pada Sumber)
                </label>
                <select
                  value={columnMapping.akarMasalah || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, akarMasalah: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rekomendasi Sumber */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rekomendasi (Tercantum pada Sumber)
                </label>
                <select
                  value={columnMapping.rekomendasi || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, rekomendasi: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Dipetakan / Kosong --</option>
                  {parsedSheets[selectedSheetIndex]?.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              &larr; Kembali
            </button>
            <button
              onClick={handleValidate}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-700/20"
            >
              Lanjut ke Validasi
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation Preview & Confirmation */}
      {step === 3 && validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F2A4A]">Hasil Validasi Data</h3>
            <p className="text-xs text-slate-500">
              Periksa ringkasan baris data yang valid dan yang memerlukan perbaikan sebelum disimpan.
            </p>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase">Baris Valid Siap Impor</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black mt-1">
                {validationResult.validRecords.length}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Data memenuhi seluruh kriteria.</p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase">Baris Gagal / Rusak</span>
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-black mt-1">
                {validationResult.invalidRows.length}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Kode kosong / baris duplikat.</p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase">Peringatan Format</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black mt-1">
                {validationResult.warnings.length}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Nilai non-angka / format koma.</p>
            </div>
          </div>

          {/* Conflict Resolution Mode (Mandat Bagian 4) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Pilihan Penanganan Jika Data untuk Periode Ini Sudah Ada:
            </label>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictMode === 'UPDATE'}
                  onChange={() => setConflictMode('UPDATE')}
                  className="text-blue-600"
                />
                <span className="font-semibold text-slate-700">
                  Perbarui data yang cocok (Rekomendasi)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictMode === 'ADD'}
                  onChange={() => setConflictMode('ADD')}
                  className="text-blue-600"
                />
                <span className="font-semibold text-slate-700">
                  Tambahkan seluruh baris sebagai data baru
                </span>
              </label>
            </div>
          </div>

          {/* Preview Table of Valid Records */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              Pratinjau Indikator yang Akan Disimpan (Sampel 5 Baris Pertama)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Indikator</th>
                    <th className="py-2.5 px-3">Dimensi</th>
                    <th className="py-2.5 px-3 text-center">Capaian Terkini</th>
                    <th className="py-2.5 px-3 text-center">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Tahun Lalu</th>
                    <th className="py-2.5 px-3 text-center">Arah Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationResult.validRecords.slice(0, 5).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{r.kodeIndikator}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.namaIndikator}</td>
                      <td className="py-2 px-3 text-slate-500">{r.dimensi}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-800">
                        {r.nilaiCapaian ?? '-'}
                      </td>
                      <td className="py-2 px-3 text-center">{r.kategoriCapaian || '-'}</td>
                      <td className="py-2 px-3 text-center font-mono">{r.nilaiTahunLalu ?? '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              &larr; Ubah Pemetaan
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Batalkan
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={validationResult.validRecords.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi & Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Success Completion */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0F2A4A]">Impor Data Berhasil Disimpan</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Data Rapor Pendidikan untuk <strong>{selectedSchool?.nama}</strong> ({targetTahun}) telah berhasil
            divalidasi dan tersimpan di sistem.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setFile(null);
                setStep(1);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              Unggah Dokumen Lain
            </button>
            <button
              onClick={() => {
                setSelectedSchoolId(selectedSchool?.id || null);
                setActiveTab('analisis-sekolah');
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-700/20 cursor-pointer"
            >
              Lanjutkan ke Analisis Rapor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
