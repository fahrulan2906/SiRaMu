import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3e3;
const isProduction = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
const DATA_DIR = path.resolve(__dirname, "data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
const GEMINI_SYSTEM_INSTRUCTION = `Anda adalah asisten analisis data pendidikan yang membantu pengawas sekolah di Indonesia (khususnya wilayah binaan Dinas Pendidikan dan Kebudayaan Kota Pontianak).
Analisis data Rapor Pendidikan yang diberikan berdasarkan informasi aktual yang tersedia.
Gunakan bahasa Indonesia yang profesional, jelas, objektif, dan mudah dipahami.
Jangan mengarang angka, nama indikator, definisi, kategori capaian, akar masalah, target, atau kebijakan resmi.
Pisahkan fakta, hasil perhitungan, interpretasi, hipotesis, dan rekomendasi.
Jika data tidak cukup, katakan secara eksplisit bahwa data belum cukup.
Jangan menyimpulkan hubungan sebab-akibat hanya berdasarkan korelasi antarindikator.
Gunakan definisi dan arah perubahan indikator yang tersedia pada sumber.
Jika definisi atau arah perubahan belum diketahui, jangan menebaknya.
Berikan rekomendasi pendampingan yang realistis, spesifik, terukur, dan dapat dilakukan oleh kepala sekolah bersama guru.
Setiap rekomendasi harus merujuk pada indikator atau temuan yang mendasarinya.
Utamakan perbaikan pembelajaran, penguatan kapasitas kepala sekolah dan guru, pengambilan keputusan berbasis data, serta peningkatan mutu layanan pendidikan.
Jangan memperlakukan rekomendasi AI sebagai keputusan final. Pengawas harus memverifikasi dan menyetujui rekomendasi sebelum digunakan.

Keluarkan hasil analisis dalam format JSON terstruktur yang valid sesuai skema yang diminta.`;
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "SI-ANALISIS RAPOR PENDIDIKAN PONTIANAK",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/storage/sync", (_req, res) => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, "utf-8");
      return res.json({ success: true, data: JSON.parse(content) });
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/storage/sync", (req, res) => {
  try {
    const payload = req.body;
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), "utf-8");
    return res.json({ success: true, message: "Data tersimpan di server" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
function generateDeterministicAnalysis(school, indicators, tahun) {
  const prioritarians = indicators.filter(
    (i) => i.arahPerubahan === "MENURUN" || i.kategoriCapaian && (i.kategoriCapaian.toLowerCase().includes("kurang") || i.kategoriCapaian.toLowerCase().includes("perlu") || i.kategoriCapaian.toLowerCase().includes("dasar"))
  );
  const strengths = indicators.filter(
    (i) => i.arahPerubahan === "MEMBAIK" && i.nilaiCapaian !== null && i.nilaiCapaian >= 55
  );
  return {
    ringkasan_eksekutif: `Berdasarkan data Rapor Pendidikan tahun ${tahun} untuk ${school.nama} (${school.jenjang}), teridentifikasi ${indicators.length} indikator terdata. Terdapat ${strengths.length} indikator dalam kondisi berkembang/membaik, serta ${prioritarians.length} indikator yang memerlukan atensi pembinaan pengawas secara terfokus.`,
    kekuatan_sekolah: strengths.length > 0 ? strengths.slice(0, 3).map(
      (s) => `${s.namaIndikator} mencapai ${s.nilaiCapaian ?? "-"} (${s.kategoriCapaian ?? "Optimal"}) dengan arah perbaikan positif.`
    ) : ["Data indikator dengan tren peningkatan signifikan belum teridentifikasi pada periode ini."],
    temuan_utama: prioritarians.slice(0, 4).map((p) => ({
      kode_indikator: p.kodeIndikator,
      nama_indikator: p.namaIndikator,
      nilai_asli: p.nilaiCapaian !== null ? `${p.nilaiCapaian} ${p.satuan || ""}` : "Belum tersedia",
      tahun_data: tahun,
      dokumen_sumber: p.dokumenSumber || "Dokumen Rapor Pendidikan",
      fakta_data: `Capaian terkini adalah ${p.nilaiCapaian ?? "Belum ada angka"} (${p.kategoriCapaian ?? "Perlu Perhatian"}), dengan perubahan ${p.perubahan !== null ? (p.perubahan > 0 ? "+" : "") + p.perubahan : "belum ada data pembanding"}.`,
      interpretasi: `Indikator ${p.namaIndikator} berada pada kategori ${p.kategoriCapaian || "rendah"} atau mengalami penurunan dari periode sebelumnya.`,
      dasar_interpretasi: p.arahPerubahan === "MENURUN" ? "Penurunan skor numerik antartahun" : "Kategori capaian di bawah ambang batas standar",
      status_bukti: "Fakta Rapor Pendidikan Resmi",
      tingkat_prioritas: p.arahPerubahan === "MENURUN" ? "Tinggi" : "Sedang",
      alasan_prioritas: "Berpengaruh langsung terhadap mutu layanan pembelajaran peserta didik.",
      keterbatasan_analisis: "Analisis berbasis data agregat satuan; rincian per rombel atau sub-indikator perlu dicek di lembar kerja sekolah."
    })),
    hipotesis_akar_masalah: prioritarians.slice(0, 3).map((p) => ({
      dugaan_masalah: p.akarMasalahSumber || `Praktek pembelajaran dan pengelolaan program terkait ${p.namaIndikator} belum berjalan optimal secara terstruktur.`,
      dasar_dugaan: `Korelasi dengan capaian kategori ${p.kategoriCapaian || "rendah"} pada dokumen Rapor Pendidikan.`,
      status_hipotesis: "Hipotesis \u2014 Perlu Verifikasi Bukti Nyata Lapangan",
      bukti_yang_diperlukan: `Dokumen perencanaan pembelajaran (modul ajar), catatan supervisi kelas, dan instrumen asesmen formatif.`,
      metode_verifikasi: `Wawancara dengan kepala sekolah, observasi pembelajaran di kelas, dan telaah dokumen fisik pendukung.`
    })),
    rekomendasi_pendampingan: prioritarians.slice(0, 3).map((p, idx) => ({
      id: `rec-gen-${idx + 1}`,
      indikator_terkait: `${p.kodeIndikator} ${p.namaIndikator}`,
      tujuan_perbaikan: `Meningkatkan capaian dan mutu implementasi ${p.namaIndikator} melalui pendampingan berkelanjutan.`,
      langkah_pendampingan: [
        `Melakukan diskusi refleksi bersama kepala sekolah dan tim pengembang sekolah.`,
        `Mengidentifikasi kebutuhan pelatihan guru pada materi terkait melalui Komunitas Belajar (Kombel).`,
        `Melakukan supervisi kelas dan monitoring kemajuan secara berkala.`
      ],
      pihak_terlibat: ["Pengawas Pembina", "Kepala Sekolah", "Dewan Guru"],
      indikator_keberhasilan: `Peningkatan skor atau perbaikan kategori capaian pada evaluasi periode berikutnya.`,
      bukti_dukung: "Notula diskusi, daftar hadir Kombel, dan dokumen perencanaan perbaikan.",
      jangka_waktu: "3 Bulan ke depan",
      status_rekomendasi: "Perlu validasi pengawas"
    })),
    data_yang_perlu_dilengkapi: [
      "Dokumen Kurikulum Operasional Satuan Pendidikan (KOSP/KTSP) tahun berjalan.",
      "Data hasil asesmen formatif berkala yang dilakukan pendidik.",
      "Rencana Kegiatan dan Anggaran Sekolah (RKAS) yang memuat pos kegiatan terkait."
    ],
    kesimpulan: `Fokus utama pendampingan pengawas bagi ${school.nama} pada tahun ${tahun} diprioritaskan pada penanganan ${prioritarians.length > 0 ? prioritarians.map((p) => p.namaIndikator).join(", ") : "peningkatan mutu umum"} melalui kolaborasi intensif kepala sekolah dan dewan guru.`
  };
}
app.post("/api/analyze-school", async (req, res) => {
  try {
    const { school, indicators, tahun } = req.body;
    if (!school || !indicators || !Array.isArray(indicators)) {
      return res.status(400).json({
        success: false,
        error: "Data sekolah dan daftar indikator wajib disertakan."
      });
    }
    if (indicators.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Belum ada data indikator yang dapat dianalisis untuk sekolah ini."
      });
    }
    const sanitizedIndicators = indicators.map((ind) => ({
      kode: ind.kodeIndikator,
      nama: ind.namaIndikator,
      dimensi: ind.dimensi,
      nilaiCapaian: ind.nilaiCapaian,
      kategoriCapaian: ind.kategoriCapaian,
      nilaiTahunLalu: ind.nilaiTahunLalu,
      kategoriTahunLalu: ind.kategoriTahunLalu,
      perubahan: ind.perubahan,
      arahPerubahan: ind.arahPerubahan,
      satuan: ind.satuan,
      deskripsi: ind.deskripsi,
      akarMasalahSumber: ind.akarMasalahSumber,
      rekomendasiSumber: ind.rekomendasiSumber
    }));
    if (!aiClient) {
      const fallback = generateDeterministicAnalysis(school, indicators, tahun);
      return res.json({
        success: true,
        model: "mesin-deterministik-standar (kunci API belum terpasang)",
        data: fallback,
        isFallback: true
      });
    }
    const promptText = `Lakukan analisis komprehensif terhadap data Rapor Pendidikan berikut:
Identitas Satuan Pendidikan:
- Nama Sekolah: ${school.nama}
- NPSN: ${school.npsn}
- Jenjang: ${school.jenjang}
- Wilayah: ${school.kecamatan}, Kota Pontianak
- Tahun Evaluasi: ${tahun}

Daftar Indikator Rapor Pendidikan yang Tersedia (${sanitizedIndicators.length} Indikator):
${JSON.stringify(sanitizedIndicators, null, 2)}

Instruksi Khusus Analisis:
1. Pisahkan fakta data dari Rapor Pendidikan dengan hipotesis dugaan akar masalah.
2. Analisis indikator sesuai jenjang (${school.jenjang}). ${school.jenjang === "SD" ? "Perhatikan dimensi literasi, numerasi, karakter, kualitas pembelajaran, dan lingkungan belajar." : "Perhatikan kekhasan PAUD (tumbuh kembang anak, bermain bermakna, kemitraan orang tua, dan lingkungan ramah anak tanpa paksaan calistung kaku)."}
3. Untuk setiap rekomendasi, susun langkah yang terukur dan realistis untuk dijalankan oleh kepala sekolah bersama guru.
4. Jangan membuat angka rekaan. Jika data tidak tersedia atau pembanding kurang, nyatakan apa adanya di data_yang_perlu_dilengkapi.`;
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ringkasan_eksekutif: {
                type: Type.STRING,
                description: "Ringkasan eksekutif kondisi sekolah"
              },
              kekuatan_sekolah: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar capaian positif dan kekuatan sekolah"
              },
              temuan_utama: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kode_indikator: { type: Type.STRING },
                    nama_indikator: { type: Type.STRING },
                    nilai_asli: { type: Type.STRING, description: "Nilai angka asli sesuai dokumen sumber" },
                    tahun_data: { type: Type.INTEGER, description: "Tahun data laporan" },
                    dokumen_sumber: { type: Type.STRING, description: "Nama dokumen atau lembar rapor sumber" },
                    fakta_data: { type: Type.STRING },
                    interpretasi: { type: Type.STRING },
                    dasar_interpretasi: { type: Type.STRING, description: "Dasar penilaian misal ambang batas atau arah perubahan" },
                    status_bukti: { type: Type.STRING, description: "Fakta Rapor Pendidikan atau Hasil Survei" },
                    tingkat_prioritas: { type: Type.STRING },
                    alasan_prioritas: { type: Type.STRING },
                    keterbatasan_analisis: { type: Type.STRING }
                  },
                  required: [
                    "kode_indikator",
                    "nama_indikator",
                    "fakta_data",
                    "interpretasi",
                    "status_bukti",
                    "tingkat_prioritas",
                    "alasan_prioritas",
                    "keterbatasan_analisis"
                  ]
                }
              },
              hipotesis_akar_masalah: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dugaan_masalah: { type: Type.STRING },
                    dasar_dugaan: { type: Type.STRING },
                    status_hipotesis: { type: Type.STRING, description: "Hipotesis \u2014 Perlu Verifikasi Bukti Lapangan" },
                    bukti_yang_diperlukan: { type: Type.STRING },
                    metode_verifikasi: { type: Type.STRING }
                  },
                  required: [
                    "dugaan_masalah",
                    "dasar_dugaan",
                    "bukti_yang_diperlukan",
                    "metode_verifikasi"
                  ]
                }
              },
              rekomendasi_pendampingan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    indikator_terkait: { type: Type.STRING },
                    tujuan_perbaikan: { type: Type.STRING },
                    langkah_pendampingan: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    pihak_terlibat: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    indikator_keberhasilan: { type: Type.STRING },
                    bukti_dukung: { type: Type.STRING },
                    jangka_waktu: { type: Type.STRING },
                    status_rekomendasi: { type: Type.STRING }
                  },
                  required: [
                    "indikator_terkait",
                    "tujuan_perbaikan",
                    "langkah_pendampingan",
                    "pihak_terlibat",
                    "indikator_keberhasilan",
                    "bukti_dukung",
                    "jangka_waktu"
                  ]
                }
              },
              data_yang_perlu_dilengkapi: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              kesimpulan: {
                type: Type.STRING,
                description: "Kesimpulan ringkas untuk pengawas"
              }
            },
            required: [
              "ringkasan_eksekutif",
              "kekuatan_sekolah",
              "temuan_utama",
              "hipotesis_akar_masalah",
              "rekomendasi_pendampingan",
              "data_yang_perlu_dilengkapi",
              "kesimpulan"
            ]
          }
        }
      });
      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed.rekomendasi_pendampingan)) {
        parsed.rekomendasi_pendampingan = parsed.rekomendasi_pendampingan.map(
          (rec, idx) => ({
            ...rec,
            id: `rec-ai-${idx + 1}-${Date.now()}`,
            status_rekomendasi: rec.status_rekomendasi || "Perlu validasi pengawas"
          })
        );
      }
      return res.json({
        success: true,
        model: "gemini-3.8-flash",
        data: parsed,
        isFallback: false
      });
    } catch (aiError) {
      console.error("Gemini API execution error:", aiError);
      const fallback = generateDeterministicAnalysis(school, indicators, tahun);
      return res.json({
        success: true,
        model: "mesin-deterministik-standar (koreksi kegagalan API)",
        data: fallback,
        isFallback: true,
        warning: `Pemberitahuan: Analisis diproses dengan modul perhitungan deterministik aplikasi (${aiError.message || "Layanan AI sementara tidak merespons"}).`
      });
    }
  } catch (error) {
    console.error("Server error in /api/analyze-school:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Terjadi kesalahan pemrosesan pada server."
    });
  }
});
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SI-ANALISIS RAPOR PENDIDIKAN] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}
startServer();
