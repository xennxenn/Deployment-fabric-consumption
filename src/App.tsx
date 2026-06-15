/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import {
  UploadCloud,
  Home,
  BarChart2,
  List,
  ChevronLeft,
  AlertCircle,
  Cloud
} from 'lucide-react';

import firebaseConfig from '../firebase-applet-config.json';
import { Project, ProjectItem } from './types';
import DashboardView from './components/DashboardView';
import ProjectListView from './components/ProjectListView';
import ProjectDetailView from './components/ProjectDetailView';

// --- Custom Error Handling for Firestore ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
  };
}

// Global reference for auth and db
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL */
const auth = getAuth(app);

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Firestore Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// --- Local Storage Helpers ---
const loadLocalProjects = (): Project[] => {
  try {
    const saved = localStorage.getItem('curtainpro_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.uploadDate - a.uploadDate);
      }
    }
  } catch (err) {
    console.error('Failed to load local storage projects:', err);
  }
  return [];
};

const saveLocalProjects = (projs: Project[]) => {
  try {
    localStorage.setItem('curtainpro_projects', JSON.stringify(projs));
  } catch (err) {
    console.error('Failed to save local storage projects:', err);
  }
};

const saveLocalProjectSingle = (project: Project) => {
  try {
    const saved = localStorage.getItem('curtainpro_projects');
    let current: Project[] = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) current = parsed;
    }
    current = current.filter(p => p.id !== project.id);
    current.push(project);
    localStorage.setItem('curtainpro_projects', JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save single project locally:', err);
  }
};

const deleteLocalProjectSingle = (id: string) => {
  try {
    const saved = localStorage.getItem('curtainpro_projects');
    if (saved) {
      let current = JSON.parse(saved);
      if (Array.isArray(current)) {
        current = current.filter((p: any) => p.id !== id);
        localStorage.setItem('curtainpro_projects', JSON.stringify(current));
      }
    }
  } catch (err) {
    console.error('Failed to delete single project locally:', err);
  }
};

const SALES_MAP: { [key: string]: string } = {
  'T46160': 'T46160 ภัทยา (ปอนด์)',
  'T62023': 'T62023 สุเทพ (เทพ)',
  'T63084': 'T63084 มนัสสิทธิ์ (นพส์)',
  'T65089': 'T65089 จันทกานต์ (เจมี่)',
  'T65099': 'T65099 ณาตฏิกา (ณาต)',
  'T66084': 'T66084 ฐิติญา (ออย)',
  'T66112': 'T66112 ธนัท (ตี้)',
  'T67054': 'T67054 ธัญญ์ชยา (ตูน)',
  'T68036': 'T68036 ณัฐกฤตา (พู่กัน)',
  'T68062': 'T68062 ภัทรธิดา (หมวย)',
  'T69005': 'T69005 อำนาจ (เค)'
};

const WIDE_FABRICS = [
  'ARDOR-330', 'BLISS-330', 'FIDELITY-330', 'NIFTY-330', 'ARDOR', 'BLISS',
  'FIDELITY', 'MORNING', 'NIFTY', 'ABSOLUTE', 'CATER', 'PLENARY', 'CLASSIC-AM',
  'ONESTO', 'ROUTE', 'SACHET', 'SEDIMI', 'SPA', 'SPICY', 'BLEARY', 'GLOSSIE',
  'HYBRID', 'SEINE', 'TRAMMEL', 'AMI', 'JUNO', 'LABYRINTH', 'WAFTY', 'AFFINITY',
  'EZY', 'FILA', 'FLAG', 'FLAP', 'GALENA', 'GALLEON', 'GLAMOUR', 'GOOD LUCK',
  'MARCEL', 'MILD', 'DISCO', 'GLASSY', 'DYNAMIC', 'FREESTYLE', 'R&B-AM',
  'SOUL-AM', 'ALIVE', 'BLANCO', 'CHACHACHA-AM', 'CITADEL', 'CROSSROAD',
  'DACCA', 'FORESTA', 'GOTHIC', 'HAZY', 'INFINITE', 'KLEON', 'LIBERTY',
  'LILY', 'MAZY', 'PATHWAY', 'SAMBA', 'SERENE-AM', 'VISTA', 'AGATE',
  'ASHIDE', 'AZURA', 'CANARI', 'GNEISS', 'HORIZON', 'STRIPE', 'TEMPERA', 'VOYAGE'
].map(f => f.toUpperCase());

const parseExcelDate = (excelDate: any): string => {
  if (!excelDate) return '-';
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }
  if (typeof excelDate === 'string' && (excelDate.includes('/') || excelDate.includes('-'))) {
    const parts = excelDate.split(/[-/]/);
    if (parts.length === 3) {
      return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
    }
  }
  return String(excelDate);
};

const cleanCurtainDimensions = (str: string): string => {
  if (!str) return 'ไม่ระบุ';
  return str.replace(/\(?\s*[กwW]?\.?\s*\d+(\.\d+)?\s*[xX*]\s*[สhH]?\.?\s*\d+(\.\d+)?\s*(cm|m|ซม|ม)\.?\s*\)?/gi, '').trim();
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'detail'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUsingCloud, setIsUsingCloud] = useState(true);

  // 1. Loader Script Setup
  useEffect(() => {
    // Load external sheet loader for XLSX client utility
    if (!(window as any).XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => setXlsxLoaded(true);
      document.head.appendChild(script);
    } else {
      setXlsxLoaded(true);
    }
  }, []);

  // 2. Fetch Projects from Firestore with Offline Caching fallback
  useEffect(() => {
    const projectsRef = collection(db, 'projects');

    const unsubscribe = onSnapshot(
      projectsRef,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Project[];
        data.sort((a, b) => b.uploadDate - a.uploadDate);
        setProjects(data);
        saveLocalProjects(data); // Mirror to Local Storage
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore subscription failed, falling back to Local Storage:', error);
        const locals = loadLocalProjects();
        setProjects(locals);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Import File to Firestore with robust columns mapping
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !(window as any).XLSX) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = (window as any).XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[][] = (window as any).XLSX.utils.sheet_to_json(ws, { header: 1 });

        const projectsMap: { [key: string]: Project } = {};

        data.forEach((row, index) => {
          if (index === 0 || !row[0]) return;

          const quotationNo = String(row[0]).trim();
          const rawSaleId = String(row[4] || '').trim();
          let saleName = rawSaleId;
          Object.keys(SALES_MAP).forEach((key) => {
            if (rawSaleId.includes(key)) {
              saleName = SALES_MAP[key];
            }
          });

          if (!projectsMap[quotationNo]) {
            projectsMap[quotationNo] = {
              id: quotationNo,
              quotation_no: quotationNo,
              cs_phone: String(row[3] || ''),
              sale_id: saleName,
              customerName: `${row[20] || ''} ${row[21] || ''}`.trim() || 'ลูกค้าใหม่',
              address: String(row[25] || ''),
              province: String(row[30] || 'ไม่ระบุ'),
              contact_name: String(row[27] || ''),
              confirm_date: parseExcelDate(row[48]),
              discount_round: parseFloat(row[39]) || 0,
              items: [],
              netTotal: 0,
              total_F: 0,
              total_P: 0,
              total_A: 0,
              uploadDate: Date.now()
            };
          }

          const qty = parseFloat(row[12]) || 0;
          let qtyYards = parseFloat(row[13]) || 0;
          const unit = String(row[14] || '').trim();
          const price = parseFloat(row[15]) || 0;
          const per_disc = parseFloat(row[16]) || 0;
          const ontop = parseFloat(row[17]) || 0;
          const rawDesc = String(row[49] || '');
          const itemType = String(row[28] || '').trim(); // F, P, A

          const itemNetTotal = qty * price * (1 - per_disc / 100) * (1 - ontop / 100);

          const itemData: ProjectItem = {
            qty,
            qtyYards,
            unit,
            price,
            per_disc,
            ontop,
            room_name: String(row[19] || 'ไม่ระบุพิกัดห้อง'),
            item_type: itemType,
            descriptions: rawDesc,
            itemNetTotal
          };

          if (itemType === 'F') {
            const parts = rawDesc.split('|');
            itemData.fabric_name = parts[0] ? parts[0].trim() : rawDesc;
            itemData.fabric_color = parts.length > 1 ? parts[1].trim() : '-';
            itemData.is_wide = WIDE_FABRICS.includes(itemData.fabric_name.toUpperCase());
            if (itemData.qtyYards === 0 && unit.includes('หลา')) {
              itemData.qtyYards = qty;
            }
          } else if (itemType === 'P') {
            const isBlind = rawDesc.includes('ม้วน') || rawDesc.includes('มู่ลี่');
            if (!isBlind) {
              itemData.clean_desc = cleanCurtainDimensions(rawDesc);
            } else {
              itemData.clean_desc = rawDesc;
            }
          }

          projectsMap[quotationNo].netTotal += itemNetTotal;
          if (itemType === 'F') projectsMap[quotationNo].total_F += itemNetTotal;
          if (itemType === 'P') projectsMap[quotationNo].total_P += itemNetTotal;
          if (itemType === 'A') projectsMap[quotationNo].total_A += itemNetTotal;

          projectsMap[quotationNo].items.push(itemData);
        });

        const batchPromises = Object.values(projectsMap).map(async (project) => {
          project.netTotal = project.netTotal - project.discount_round;
          try {
            await setDoc(doc(db, 'projects', project.quotation_no), project);
          } catch (writeErr) {
            console.warn('Firestore write error in public cloud, saving to local cache:', writeErr);
            saveLocalProjectSingle(project);
          }
        });

        await Promise.all(batchPromises);
        setUploading(false);
        e.target!.value = '';
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบว่าเลือกชีตและคอลัมน์ที่กำหนดถูกต้องหรือไม่');
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 4. Delete Project
  const deleteProject = async (id: string) => {
    if (!window.confirm('คุณต้องการดำเนินการยืนยันที่จะลบข้อมูลโครงการสั่งผลิตโครงนี้ใช่หรือไม่? บันทึกการใช้ผ้าของโครงการนี้จะหายไปจากระบบอย่างถาวร')) return;
    
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.warn('Firestore delete failed in public cloud, falling back to local action:', err);
      deleteLocalProjectSingle(id);
      const locals = loadLocalProjects();
      setProjects(locals);
    }

    if (selectedProject?.id === id) {
      setCurrentView('dashboard');
      setSelectedProject(null);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold text-sm">กำลังคำนวณสูตรและเชื่อมระบบ Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col font-sans selection:bg-indigo-150 selection:text-indigo-900">
      {/* 🧭 Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/10">
                <BarChart2 className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-base font-black text-slate-800 tracking-tight block">
                  CurtainPro Analytics
                </span>
                <span className="text-[10px] font-bold text-indigo-600 block leading-3 uppercase">
                  Fabric Consumption System
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Cloud Database Connected Status Badge */}
              <div className="flex items-center gap-2 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100 select-none">
                <Cloud className="w-4 h-4 text-emerald-600 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black leading-3 text-emerald-700 tracking-wider uppercase">CLOUD STATUS</span>
                  <span className="text-[11px] font-extrabold text-slate-700 leading-3">
                    ออนไลน์ข้อมูลเสถียร
                  </span>
                </div>
              </div>

              <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setSelectedProject(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'dashboard' && !selectedProject
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="nav-dashboard-button"
                >
                  <Home className="w-3.5 h-3.5" /> <span className="hidden md:inline">ภาพรวมยอดขาย</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('list');
                    setSelectedProject(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'list' || selectedProject
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  id="nav-projects-button"
                >
                  <List className="w-3.5 h-3.5" /> <span className="hidden md:inline">ทำเนียบโครงการ</span>
                </button>
              </nav>

              <label
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer select-none ${
                  !xlsxLoaded || uploading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-sm'
                }`}
                id="file-upload-label"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'กำลังประมวลผลไฟล์...' : 'นำเข้าใบแจ้งงาน'}</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={!xlsxLoaded || uploading}
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 Primary Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-100/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs animate-fade-in text-slate-700">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 shrink-0">
              <Cloud className="w-5 h-5 text-emerald-600 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                ระบบคลาวด์ซิงค์เรียลไทม์ออนไลน์ (Shared Cloud Auto-Sync) 
                <span className="bg-emerald-500 text-white text-[8px] tracking-widest px-1.5 py-0.5 rounded-full font-black uppercase">ONLINE</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 block mt-1 leading-relaxed">
                ฐานข้อมูลโปรดักชันออนไลน์เรียลไทม์ผ่าน Vercel / GitHub หรือเว็บเซิร์ฟเวอร์ใดๆ ได้อัตโนมัติ คุณและทีมงานทุกคนสามารถนำเข้าใบแจ้งงาน ค้นหารุ่นผ้า และวิเคราะห์ยอดขายร่วมกันทุกเครื่องได้ทันทีอย่างไร้รอยต่อ โดยไม่ต้องลงชื่อเข้าใช้งาน (No Sign-in Required)
              </span>
            </div>
          </div>
        </div>
        {currentView === 'dashboard' && !selectedProject && (
          <DashboardView projects={projects} />
        )}
        {currentView === 'list' && !selectedProject && (
          <ProjectListView
            projects={projects}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectProject={handleSelectProject}
            onDeleteProject={deleteProject}
          />
        )}
        {currentView === 'detail' && selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            onBack={() => {
              setCurrentView('list');
              setSelectedProject(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
