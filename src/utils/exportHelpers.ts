import * as XLSX from 'xlsx';
import { School, RaporRecord, AnalysisRecord, ActionPlan, SupervisorProfile } from '../types';

/**
 * Download a Blob as a file in browser
 */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export Data to Native Excel XLSX
 */
export function exportToXLSX(data: any[], fileName: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${fileName}.xlsx`);
}

/**
 * 2. Export Data to CSV
 */
export function exportToCSV(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${fileName}.csv`);
}

/**
 * 3. Export Formatted Report to Word Document (.doc / .docx compatible)
 */
export function exportReportToWord(
  title: string,
  contentHtml: string,
  profile: SupervisorProfile,
  fileName: string
) {
  const today = new Date();
  const dateFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${today.getFullYear()}`;

  const fullWordHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 2cm; }
    h1 { font-size: 16pt; text-align: center; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; color: #0F2A4A; }
    h2 { font-size: 14pt; text-align: center; margin-bottom: 2px; color: #333; }
    h3 { font-size: 12pt; margin-top: 18px; margin-bottom: 6px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; color: #0F2A4A; }
    p { margin-bottom: 8px; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; font-size: 10.5pt; }
    th { background-color: #f2f5f8; border: 1px solid #333; padding: 6px; font-weight: bold; text-align: left; }
    td { border: 1px solid #444; padding: 6px; vertical-align: top; }
    .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
    .signature-box { margin-top: 40px; float: right; width: 280px; text-align: center; }
    .clear { clear: both; }
    .badge { font-weight: bold; padding: 2px 6px; }
  </style>
</head>
<body>
  <div class="kop">
    <h2 style="font-size: 13pt; margin: 0;">PEMERINTAH KOTA PONTIANAK</h2>
    <h1 style="font-size: 15pt; margin: 0;">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
    <p style="margin: 2px 0; font-size: 10pt; font-style: italic;">Sistem Informasi Analisis Rapor Pendidikan dan Pendampingan Satuan Pendidikan</p>
    <p style="margin: 0; font-size: 9pt;">Wilayah Binaan Pengawas Sekolah Kota Pontianak - Kalimantan Barat</p>
  </div>

  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="font-size: 14pt; margin: 0;">${title}</h1>
    <p style="font-size: 10pt; color: #555; margin-top: 4px;">Tanggal Terbit Laporan: ${dateFormatted} | Dokumen Resmi Pengawasan</p>
  </div>

  ${contentHtml}

  <div class="signature-box">
    <p style="margin-bottom: 60px;">
      Pontianak, ${dateFormatted}<br>
      Pengawas Sekolah Pembina,
    </p>
    <p style="font-weight: bold; text-decoration: underline; margin-bottom: 0;">
      ${profile.nama}
    </p>
    <p style="margin-top: 0; font-size: 10pt;">
      NIP. ${profile.nip}<br>
      ${profile.pangkatGolongan}
    </p>
  </div>
  <div class="clear"></div>
</body>
</html>`;

  const blob = new Blob([fullWordHtml], { type: 'application/msword;charset=utf-8' });
  downloadBlob(blob, `${fileName}.doc`);
}

/**
 * 4. Trigger Native Print Preview for PDF Generation
 */
/**
 * 4. Trigger Direct Print Preview for PDF Generation (No window.open, 100% iFrame safe)
 */
export function printReportPreview(_elementId?: string) {
  window.print();
}
