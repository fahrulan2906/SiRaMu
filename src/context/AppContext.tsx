import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  School,
  RaporRecord,
  AnalysisRecord,
  ActionPlan,
  UploadBatch,
  SupervisorProfile,
  Jenjang,
} from '../types';
import {
  INITIAL_SCHOOLS,
  DEMO_SCHOOL_SD,
  DEMO_SCHOOL_TK,
  DEMO_RAPOR_RECORDS,
  DEMO_ANALYSIS_RECORDS,
  DEMO_ACTION_PLANS,
  DEFAULT_SUPERVISOR_PROFILE,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  // State
  schools: School[];
  raporRecords: RaporRecord[];
  analysisRecords: AnalysisRecord[];
  actionPlans: ActionPlan[];
  uploadBatches: UploadBatch[];
  supervisorProfile: SupervisorProfile;
  demoMode: boolean;
  activeTab: string;
  selectedJenjangFilter: 'ALL' | 'SD' | 'TK';
  selectedTahunFilter: number | 'ALL';
  selectedSchoolId: string | null;
  toasts: ToastMessage[];
  isLoadingAI: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  setSelectedJenjangFilter: (jenjang: 'ALL' | 'SD' | 'TK') => void;
  setSelectedTahunFilter: (tahun: number | 'ALL') => void;
  setSelectedSchoolId: (id: string | null) => void;
  setDemoMode: (enabled: boolean) => void;
  
  // School Management
  addSchool: (school: Omit<School, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'isVerified'>) => void;
  updateSchool: (id: string, updates: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  resetToDefault17Schools: () => void;

  // Rapor Data Management
  importRaporRecords: (
    records: RaporRecord[],
    conflictMode: 'ADD' | 'UPDATE' | 'CANCEL',
    batchMeta: Omit<UploadBatch, 'id' | 'tanggalUnggah'>
  ) => boolean;
  deleteSchoolRecords: (schoolId: string, tahun?: number) => void;

  // Analysis Management
  runSchoolAnalysis: (schoolId: string, tahun: number) => Promise<AnalysisRecord | null>;
  updateAnalysisValidation: (
    analysisId: string,
    status: AnalysisRecord['statusValidasiPengawas'],
    catatan?: string
  ) => void;
  updateAnalysisRecord: (analysisId: string, updates: Partial<AnalysisRecord>) => void;
  updateRecommendationStatus: (
    analysisId: string,
    recId: string,
    newStatus: 'Perlu validasi pengawas' | 'Disetujui' | 'Ditolak'
  ) => void;

  // Action Plan Management
  addActionPlan: (plan: Omit<ActionPlan, 'id' | 'createdAt' | 'updatedAt' | 'isDemo'>) => void;
  updateActionPlan: (id: string, updates: Partial<ActionPlan>) => void;
  deleteActionPlan: (id: string) => void;
  createPlanFromRecommendation: (
    school: School,
    tahun: number,
    rec: any,
    targetDate: string
  ) => void;

  // Demo Data Purge
  deleteDemoData: () => void;

  // Settings
  updateSupervisorProfile: (profile: Partial<SupervisorProfile>) => void;

  // Toast
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SCHOOLS: 'si_rapor_schools_v1',
  RECORDS: 'si_rapor_records_v1',
  ANALYSES: 'si_rapor_analyses_v1',
  PLANS: 'si_rapor_plans_v1',
  BATCHES: 'si_rapor_batches_v1',
  PROFILE: 'si_rapor_profile_v1',
  DEMO_MODE: 'si_rapor_demo_mode_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize Schools
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default includes initial 17 schools + demo schools for testing
    return [...INITIAL_SCHOOLS, DEMO_SCHOOL_SD, DEMO_SCHOOL_TK];
  });

  // Initialize Rapor Records
  const [raporRecords, setRaporRecords] = useState<RaporRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_RAPOR_RECORDS;
  });

  // Initialize Analysis Records
  const [analysisRecords, setAnalysisRecords] = useState<AnalysisRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_ANALYSIS_RECORDS;
  });

  // Initialize Action Plans
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_ACTION_PLANS;
  });

  // Upload Batches
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'batch-demo-01',
        namaFile: 'Rapor_Pendidikan_SD_Simulasi_2024.xlsx',
        schoolId: DEMO_SCHOOL_SD.id,
        namaSekolah: DEMO_SCHOOL_SD.nama,
        jenjang: 'SD',
        tahun: 2024,
        tanggalUnggah: '15-01-2026 09:30',
        jumlahBaris: 7,
        statusValidasi: 'Berhasil',
        statusAnalisis: 'Sudah Dianalisis',
      },
      {
        id: 'batch-demo-02',
        namaFile: 'Rapor_Pendidikan_PAUD_Simulasi_2024.xlsx',
        schoolId: DEMO_SCHOOL_TK.id,
        namaSekolah: DEMO_SCHOOL_TK.nama,
        jenjang: 'TK',
        tahun: 2024,
        tanggalUnggah: '15-01-2026 10:00',
        jumlahBaris: 3,
        statusValidasi: 'Berhasil',
        statusAnalisis: 'Belum Dianalisis',
      },
    ];
  });

  const [supervisorProfile, setSupervisorProfile] = useState<SupervisorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nama === 'Drs. H. Mulyadi, M.Pd.' || !parsed.nama) {
          return DEFAULT_SUPERVISOR_PROFILE;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_SUPERVISOR_PROFILE;
  });

  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true; // Default true so user can immediately test
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<'ALL' | 'SD' | 'TK'>('ALL');
  const [selectedTahunFilter, setSelectedTahunFilter] = useState<number | 'ALL'>('ALL');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(raporRecords));
  }, [raporRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analysisRecords));
  }, [analysisRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(actionPlans));
  }, [actionPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(uploadBatches));
  }, [uploadBatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(supervisorProfile));
  }, [supervisorProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, JSON.stringify(demoMode));
  }, [demoMode]);

  // Sync to server-side backup on major changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/storage/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schools,
          raporRecords,
          analysisRecords,
          actionPlans,
          uploadBatches,
          supervisorProfile,
          updatedAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [schools, raporRecords, analysisRecords, actionPlans, uploadBatches, supervisorProfile]);

  // Toast Helpers
  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled);
    if (!enabled) {
      addToast(
        'Mode Data Demonstrasi Dinonaktifkan',
        'Data fiktif demonstrasi disembunyikan dari tabel dan statistik utama.',
        'info'
      );
    } else {
      addToast(
        'Mode Data Demonstrasi Aktif',
        'Data percontohan simulasi SD & TK ditampilkan untuk keperluan pengujian fitur.',
        'info'
      );
    }
  };

  // School Management
  const addSchool = (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'isVerified'>) => {
    const newSchool: School = {
      ...schoolData,
      id: `sch-${Date.now()}`,
      isVerified: true,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSchools((prev) => [newSchool, ...prev]);
    addToast('Berhasil Menambahkan Sekolah', `${newSchool.nama} berhasil didaftarkan ke binaan.`);
  };

  const updateSchool = (id: string, updates: Partial<School>) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
    addToast('Perubahan Disimpan', 'Data sekolah binaan berhasil diperbarui.', 'success');
  };

  const deleteSchool = (id: string) => {
    const school = schools.find((s) => s.id === id);
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setRaporRecords((prev) => prev.filter((r) => r.schoolId !== id));
    setAnalysisRecords((prev) => prev.filter((a) => a.schoolId !== id));
    setActionPlans((prev) => prev.filter((p) => p.schoolId !== id));
    addToast(
      'Sekolah Dihapus',
      `${school?.nama || 'Sekolah'} dan seluruh data terkait telah dihapus.`,
      'warning'
    );
  };

  const resetToDefault17Schools = () => {
    setSchools([...INITIAL_SCHOOLS, DEMO_SCHOOL_SD, DEMO_SCHOOL_TK]);
    addToast(
      'Data Sekolah Direset',
      '17 Satuan pendidikan binaan (12 SD dan 5 TK) telah dikembalikan ke kondisi awal.',
      'info'
    );
  };

  // Import Rapor Records
  const importRaporRecords = (
    newRecords: RaporRecord[],
    conflictMode: 'ADD' | 'UPDATE' | 'CANCEL',
    batchMeta: Omit<UploadBatch, 'id' | 'tanggalUnggah'>
  ): boolean => {
    if (conflictMode === 'CANCEL') {
      addToast('Impor Dibatalkan', 'Proses impor file tidak disimpan.', 'info');
      return false;
    }

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newBatch: UploadBatch = {
      ...batchMeta,
      id: `batch-${Date.now()}`,
      tanggalUnggah: dateFormatted,
    };

    setRaporRecords((prev) => {
      if (conflictMode === 'ADD') {
        return [...prev, ...newRecords];
      } else {
        // UPDATE: replace matches based on schoolId + tahun + kodeIndikator
        const matchKeys = new Set(
          newRecords.map((r) => `${r.schoolId}_${r.tahun}_${r.kodeIndikator}`)
        );
        const filtered = prev.filter(
          (r) => !matchKeys.has(`${r.schoolId}_${r.tahun}_${r.kodeIndikator}`)
        );
        return [...filtered, ...newRecords];
      }
    });

    setUploadBatches((prev) => [newBatch, ...prev]);

    // Mark school as having data
    setSchools((prev) =>
      prev.map((s) =>
        s.id === batchMeta.schoolId ? { ...s, updatedAt: new Date().toISOString() } : s
      )
    );

    addToast(
      'Impor Data Berhasil',
      `Sebanyak ${newRecords.length} indikator Rapor Pendidikan berhasil diimpor untuk ${batchMeta.namaSekolah}.`,
      'success'
    );
    return true;
  };

  const deleteSchoolRecords = (schoolId: string, tahun?: number) => {
    setRaporRecords((prev) =>
      prev.filter((r) => {
        if (tahun) {
          return !(r.schoolId === schoolId && r.tahun === tahun);
        }
        return r.schoolId !== schoolId;
      })
    );
    addToast('Data Dihapus', 'Data indikator rapor untuk periode terpilih berhasil dihapus.', 'info');
  };

  // Run AI Analysis
  const runSchoolAnalysis = async (
    schoolId: string,
    tahun: number
  ): Promise<AnalysisRecord | null> => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) {
      addToast('Kesalahan', 'Data sekolah tidak ditemukan.', 'error');
      return null;
    }

    const schoolRecords = raporRecords.filter(
      (r) => r.schoolId === schoolId && r.tahun === tahun
    );

    if (schoolRecords.length === 0) {
      addToast(
        'Data Belum Cukup',
        `Sekolah ${school.nama} belum memiliki data Rapor Pendidikan untuk tahun ${tahun}. Silakan unggah dokumen terlebih dahulu.`,
        'warning'
      );
      return null;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/analyze-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school,
          indicators: schoolRecords,
          tahun,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Gagal menjalankan analisis.');
      }

      // Count deterministics
      let membaik = 0;
      let menurun = 0;
      let tetap = 0;
      let belumDapat = 0;

      schoolRecords.forEach((r) => {
        if (r.arahPerubahan === 'MEMBAIK') membaik++;
        else if (r.arahPerubahan === 'MENURUN') menurun++;
        else if (r.arahPerubahan === 'TIDAK_BERUBAH') tetap++;
        else belumDapat++;
      });

      const newAnalysis: AnalysisRecord = {
        id: `analysis-${Date.now()}`,
        schoolId: school.id,
        namaSekolah: school.nama,
        jenjang: school.jenjang,
        tahun,
        waktuAnalisis: new Date().toISOString(),
        modelDigunakan: resData.model || 'gemini-3.8-flash',
        dokumenSumber: schoolRecords[0]?.dokumenSumber || 'Dokumen Rapor Pendidikan',
        isDemo: school.isDemo,
        statusValidasiPengawas: 'Belum Divalidasi',
        totalIndikator: schoolRecords.length,
        indikatorMembaik: membaik,
        indikatorMenurun: menurun,
        indikatorTetap: tetap,
        indikatorBelumDapatDibandingkan: belumDapat,
        skorPrioritasInternal: Math.round(((menurun / schoolRecords.length) * 100) * 10) / 10,
        hasilAI: resData.data,
      };

      setAnalysisRecords((prev) => {
        // replace existing analysis for same school & tahun if exists
        const filtered = prev.filter(
          (a) => !(a.schoolId === schoolId && a.tahun === tahun)
        );
        return [newAnalysis, ...filtered];
      });

      // Update upload batch status
      setUploadBatches((prev) =>
        prev.map((b) =>
          b.schoolId === schoolId && b.tahun === tahun
            ? { ...b, statusAnalisis: 'Sudah Dianalisis' }
            : b
        )
      );

      if (resData.warning) {
        addToast('Analisis Selesai (Modul Deterministik)', resData.warning, 'info');
      } else {
        addToast(
          'Analisis Berhasil Selesai',
          `Hasil analisis cerdas dan rekomendasi untuk ${school.nama} telah siap diverifikasi.`,
          'success'
        );
      }

      return newAnalysis;
    } catch (err: any) {
      console.error(err);
      addToast('Analisis Gagal', err.message || 'Gagal memproses data analisis.', 'error');
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const updateAnalysisValidation = (
    analysisId: string,
    status: AnalysisRecord['statusValidasiPengawas'],
    catatan?: string
  ) => {
    setAnalysisRecords((prev) =>
      prev.map((a) =>
        a.id === analysisId
          ? {
              ...a,
              statusValidasiPengawas: status,
              catatanPengawas: catatan !== undefined ? catatan : a.catatanPengawas,
            }
          : a
      )
    );
    addToast('Status Validasi Disimpan', `Analisis telah ditandai sebagai "${status}".`, 'success');
  };

  const updateRecommendationStatus = (
    analysisId: string,
    recId: string,
    newStatus: 'Perlu validasi pengawas' | 'Disetujui' | 'Ditolak'
  ) => {
    setAnalysisRecords((prev) =>
      prev.map((a) => {
        if (a.id !== analysisId) return a;
        const updatedRecs = a.hasilAI.rekomendasi_pendampingan.map((rec, idx) => {
          if (rec.id === recId || `rec-${idx}` === recId || idx === Number(recId)) {
            return { ...rec, status_rekomendasi: newStatus };
          }
          return rec;
        });
        return {
          ...a,
          hasilAI: {
            ...a.hasilAI,
            rekomendasi_pendampingan: updatedRecs,
          },
        };
      })
    );
    addToast('Rekomendasi Diperbarui', `Rekomendasi pendampingan ditandai: ${newStatus}`, 'info');
  };

  const updateAnalysisRecord = (
    analysisId: string,
    updates: Partial<AnalysisRecord>
  ) => {
    setAnalysisRecords((prev) =>
      prev.map((a) => (a.id === analysisId ? { ...a, ...updates } : a))
    );
    addToast('Perubahan Disimpan', 'Hasil telaah analisis berhasil diperbarui.', 'success');
  };

  // Action Plans
  const addActionPlan = (
    planData: Omit<ActionPlan, 'id' | 'createdAt' | 'updatedAt' | 'isDemo'>
  ) => {
    const newPlan: ActionPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActionPlans((prev) => [newPlan, ...prev]);
    addToast(
      'Rencana Pendampingan Dibuat',
      `Kegiatan "${newPlan.bentukKegiatan}" berhasil dijadwalkan.`,
      'success'
    );
  };

  const updateActionPlan = (id: string, updates: Partial<ActionPlan>) => {
    setActionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    addToast('Rencana Diperbarui', 'Data rencana pendampingan berhasil disimpan.', 'success');
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans((prev) => prev.filter((p) => p.id !== id));
    addToast('Rencana Dihapus', 'Rencana pendampingan telah dihapus dari daftar.', 'info');
  };

  const createPlanFromRecommendation = (
    school: School,
    tahun: number,
    rec: any,
    targetDate: string
  ) => {
    const newPlan: ActionPlan = {
      id: `plan-${Date.now()}`,
      schoolId: school.id,
      namaSekolah: school.nama,
      jenjang: school.jenjang,
      tahun,
      indikatorPrioritas: rec.indikator_terkait || 'Indikator Prioritas Rapor Pendidikan',
      temuanUtama: rec.tujuan_perbaikan || 'Peningkatan mutu layanan pendidikan',
      tujuanPendampingan: rec.tujuan_perbaikan || '',
      bentukKegiatan: 'Pendampingan perencanaan berbasis data',
      langkahKegiatan: rec.langkah_pendampingan || ['Diskusi dengan kepala sekolah'],
      sasaran: `Dewan Guru & Kepala ${school.nama}`,
      pihakTerlibat: rec.pihak_terlibat || ['Pengawas Pembina', 'Kepala Sekolah'],
      jadwalPelaksanaan: targetDate || '28-02-2026',
      targetKeberhasilan: rec.indikator_keberhasilan || 'Peningkatan mutu indikator capaian',
      buktiDukung: rec.bukti_dukung || 'Notula, foto kegiatan, dan modul perbaikan',
      penanggungJawab: `${school.kepalaSekolah} (Kepala Sekolah)`,
      status: 'Direncanakan',
      isDemo: school.isDemo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActionPlans((prev) => [newPlan, ...prev]);
    addToast(
      'Rekomendasi Jadi Rencana',
      `Rekomendasi berhasil ditransformasikan ke Rencana Pendampingan.`,
      'success'
    );
    setActiveTab('rencana-pendampingan');
  };

  // Demo Purge
  const deleteDemoData = () => {
    setSchools((prev) => prev.filter((s) => !s.isDemo));
    setRaporRecords((prev) => prev.filter((r) => !r.isDemo));
    setAnalysisRecords((prev) => prev.filter((a) => !a.isDemo));
    setActionPlans((prev) => prev.filter((p) => !p.isDemo));
    setUploadBatches((prev) => prev.filter((b) => !b.namaSekolah.includes('[DEMO]')));
    setDemoModeState(false);
    addToast(
      'Data Demonstrasi Dihapus',
      'Seluruh data simulasi fiktif telah dibersihkan. Aplikasi kini siap diisi data riil pengawas.',
      'success'
    );
  };

  const updateSupervisorProfile = (updates: Partial<SupervisorProfile>) => {
    setSupervisorProfile((prev) => ({ ...prev, ...updates }));
    addToast('Profil Disimpan', 'Identitas pengawas sekolah berhasil diperbarui.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        schools,
        raporRecords,
        analysisRecords,
        actionPlans,
        uploadBatches,
        supervisorProfile,
        demoMode,
        activeTab,
        selectedJenjangFilter,
        selectedTahunFilter,
        selectedSchoolId,
        toasts,
        isLoadingAI,
        setActiveTab,
        setSelectedJenjangFilter,
        setSelectedTahunFilter,
        setSelectedSchoolId,
        setDemoMode,
        addSchool,
        updateSchool,
        deleteSchool,
        resetToDefault17Schools,
        importRaporRecords,
        deleteSchoolRecords,
        runSchoolAnalysis,
        updateAnalysisValidation,
        updateAnalysisRecord,
        updateRecommendationStatus,
        addActionPlan,
        updateActionPlan,
        deleteActionPlan,
        createPlanFromRecommendation,
        deleteDemoData,
        updateSupervisorProfile,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
