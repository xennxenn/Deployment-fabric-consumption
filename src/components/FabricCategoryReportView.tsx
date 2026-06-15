/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  SlidersHorizontal,
  CloudLightning,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Coins,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Tag,
  X,
  Flame,
  BookOpen,
  Sparkles,
  User,
  Calendar,
  MapPin,
  Info,
  ChevronRight,
  FolderOpen,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LabelList,
  Cell
} from 'recharts';
import { Project } from '../types';

// Pre-defined fabric categories from the system rules
const PRE_DEFINED_FABRIC_CATEGORIES: { [fabricName: string]: string } = {
  // ผ้า BLACKOUT
  'ABSOLUTE': 'ผ้า BLACKOUT',
  'CATER': 'ผ้า BLACKOUT',
  'PLENARY': 'ผ้า BLACKOUT',

  // ผ้า DIM OUT
  'BLANCO': 'ผ้า DIM OUT',
  'CITADEL': 'ผ้า DIM OUT',
  'FORESTA': 'ผ้า DIM OUT',
  'HAZY': 'ผ้า DIM OUT',
  'LILY': 'ผ้า DIM OUT',
  'PATHWAY': 'ผ้า DIM OUT',
  'SERENE-AM': 'ผ้า DIM OUT',
  'VISTA': 'ผ้า DIM OUT',
  'SOLANO': 'ผ้า DIM OUT',
  'ENAMEL': 'ผ้า DIM OUT',
  'GALA': 'ผ้า DIM OUT',
  'GRATE': 'ผ้า DIM OUT',
  'PARALLEL': 'ผ้า DIM OUT',
  'TANGLE': 'ผ้า DIM OUT',
  'SOLIA': 'ผ้า DIM OUT',
  'PIZAZZ': 'ผ้า DIM OUT',

  // ผ้า DIM OUT & HEAT BLOCK
  'MAZY': 'ผ้า DIM OUT & HEAT BLOCK',
  'SAMBA': 'ผ้า DIM OUT & HEAT BLOCK',
  'TISSER COOL': 'ผ้า DIM OUT & HEAT BLOCK',
  'LONERO': 'ผ้า DIM OUT & HEAT BLOCK',
  'MONEISS': 'ผ้า DIM OUT & HEAT BLOCK',
  'NICERE': 'ผ้า DIM OUT & HEAT BLOCK',
  'BALLET': 'ผ้า DIM OUT & HEAT BLOCK',
  'WALTZ': 'ผ้า DIM OUT & HEAT BLOCK',
  'NIGHTFALL': 'ผ้า DIM OUT & HEAT BLOCK',
  'PISCES': 'ผ้า DIM OUT & HEAT BLOCK',
  'REBOUND': 'ผ้า DIM OUT & HEAT BLOCK',
  'ULTRA VIOLET': 'ผ้า DIM OUT & HEAT BLOCK',
  'COVE': 'ผ้า DIM OUT & HEAT BLOCK',

  // ผ้า HEAT BLOCK
  'MAGGA': 'ผ้า HEAT BLOCK',
  'FLURRY': 'ผ้า HEAT BLOCK',
  'HELINA': 'ผ้า HEAT BLOCK',
  'KUIPER': 'ผ้า HEAT BLOCK',
  'LATINO': 'ผ้า HEAT BLOCK',
  'MONTAGE': 'ผ้า HEAT BLOCK',
  'ORYZA': 'ผ้า HEAT BLOCK',

  // ผ้า MULTI PURPOSE
  'SAVVY': 'ผ้า MULTI PURPOSE',
  'ALBANI': 'ผ้า MULTI PURPOSE',
  'REBECCA': 'ผ้า MULTI PURPOSE',
  'REPP': 'ผ้า MULTI PURPOSE',
  'GLITTER': 'ผ้า MULTI PURPOSE',
  'GLITTER-AM': 'ผ้า MULTI PURPOSE',
  'NIELLO': 'ผ้า MULTI PURPOSE',
  'OPULENCE': 'ผ้า MULTI PURPOSE',
  'LAMELLAR': 'ผ้า MULTI PURPOSE',
  'SODA': 'ผ้า MULTI PURPOSE',
  'BASKET VILL': 'ผ้า MULTI PURPOSE',
  'CLEAVE': 'ผ้า MULTI PURPOSE',
  'HAZE': 'ผ้า MULTI PURPOSE',
  'MOTIVE': 'ผ้า MULTI PURPOSE',
  'SILK ROAD': 'ผ้า MULTI PURPOSE',
  'TESSER': 'ผ้า MULTI PURPOSE',
  'WEAVE MUSE': 'ผ้า MULTI PURPOSE',
  'CHARCOAL-AM': 'ผ้า MULTI PURPOSE',

  // ผ้า UPHOLSTERY
  'AMATA': 'ผ้า UPHOLSTERY',

  // ผ้า SHEER
  'ARDOR-330': 'ผ้า SHEER',
  'BLISS-330': 'ผ้า SHEER',
  'FIDELITY-330': 'ผ้า SHEER',
  'NIFTY-330': 'ผ้า SHEER',
  'ARDOR': 'ผ้า SHEER',
  'BLISS': 'ผ้า SHEER',
  'FIDELITY': 'ผ้า SHEER',
  'MORNING': 'ผ้า SHEER',
  'NIFTY': 'ผ้า SHEER',
  'CLASSIC-AM': 'ผ้า SHEER',
  'ONESTO': 'ผ้า SHEER',
  'ROUTE': 'ผ้า SHEER',
  'SACHET': 'ผ้า SHEER',
  'SEDIMI': 'ผ้า SHEER',
  'SPA': 'ผ้า SHEER',
  'SPICY': 'ผ้า SHEER',
  'BLEARY': 'ผ้า SHEER',
  'GLOSSIE': 'ผ้า SHEER',
  'HYBRID': 'ผ้า SHEER',
  'SEINE': 'ผ้า SHEER',
  'TRAMMEL': 'ผ้า SHEER',
  'AMI': 'ผ้า SHEER',
  'JUNO': 'ผ้า SHEER',
  'WAFTY': 'ผ้า SHEER',
  'AFFINITY': 'ผ้า SHEER',
  'EZY': 'ผ้า SHEER',
  'FILA': 'ผ้า SHEER',
  'FLAG': 'ผ้า SHEER',
  'FLAP': 'ผ้า SHEER',
  'GALENA': 'ผ้า SHEER',
  'GALLEON': 'ผ้า SHEER',
  'GOOD LUCK': 'ผ้า SHEER',
  'MARCEL': 'ผ้า SHEER',
  'MILD': 'ผ้า SHEER',
  'DISCO': 'ผ้า SHEER',
  'GLASSY': 'ผ้า SHEER',
  'INFINITE': 'ผ้า SHEER',
  'LIBERTY': 'ผ้า SHEER',
  'CANARI': 'ผ้า SHEER',
  'HORIZON': 'ผ้า SHEER',
  'RIVERRUN': 'ผ้า SHEER',
  'MISTILY': 'ผ้า SHEER',
  'BEYS': 'ผ้า SHEER',

  // ผ้า CURTAIN
  'GLAMOUR': 'ผ้า CURTAIN',
  'KLEON': 'ผ้า CURTAIN',
  'AGATE': 'ผ้า CURTAIN',
  'ASHIDE': 'ผ้า CURTAIN',
  'AZURA': 'ผ้า CURTAIN',
  'GNEISS': 'ผ้า CURTAIN',
  'STRIPE': 'ผ้า CURTAIN',
  'TEMPERA': 'ผ้า CURTAIN',
  'VOYAGE': 'ผ้า CURTAIN',
  'NUNE': 'ผ้า CURTAIN',
  'ORGANIC': 'ผ้า CURTAIN',
  'GRAINY': 'ผ้า CURTAIN',
  'TABHA': 'ผ้า CURTAIN',
  'ARRAY': 'ผ้า CURTAIN',
  'MISTWOOD': 'ผ้า CURTAIN',
  'TRIXIE': 'ผ้า CURTAIN',
  'GEOMETRIC': 'ผ้า CURTAIN',
  'STREAMLINE': 'ผ้า CURTAIN',
  'RIFFLE': 'ผ้า CURTAIN',
  'HAVEN': 'ผ้า CURTAIN',
  'CRYSTAL': 'ผ้า CURTAIN',
  'PLETHORA': 'ผ้า CURTAIN',
  'EYES': 'ผ้า CURTAIN',
  'RIVIERA': 'ผ้า CURTAIN',
  'SEEDS': 'ผ้า CURTAIN',
  'ANDROID': 'ผ้า CURTAIN',
  'HONEY RING': 'ผ้า CURTAIN',
  'FLORESCA': 'ผ้า CURTAIN',
  'BOTANICA': 'ผ้า CURTAIN',
  'EUREKA': 'ผ้า CURTAIN',
  'EUROPA': 'ผ้า CURTAIN',
  'AURORA': 'ผ้า CURTAIN',
  'BARKLEY': 'ผ้า CURTAIN',
  'DNA': 'ผ้า CURTAIN',
  'QUARTZ': 'ผ้า CURTAIN',
  'ROMANY': 'ผ้า CURTAIN',
  'SCALE': 'ผ้า CURTAIN',
  'SHELL': 'ผ้า CURTAIN',
  'SINO': 'ผ้า CURTAIN',
  'BEETHOVEN': 'ผ้า CURTAIN',
  'MOZART': 'ผ้า CURTAIN',
  'FIJI': 'ผ้า CURTAIN',
  'GUPTA': 'ผ้า CURTAIN',
  'JAZZ': 'ผ้า CURTAIN',
  'RHYTHM': 'ผ้า CURTAIN',
  'ALLUNARE': 'ผ้า CURTAIN',
  'ARTY': 'ผ้า CURTAIN',
  'BALI': 'ผ้า CURTAIN',
  'CALISTA': 'ผ้า CURTAIN',
  'CAPPIO': 'ผ้า CURTAIN',
  'CARROLL': 'ผ้า CURTAIN',
  'CASCADA': 'ผ้า CURTAIN',
  'CHEZ PAUL': 'ผ้า CURTAIN',
  'CHINOISE': 'ผ้า CURTAIN',
  'CICLO': 'ผ้า CURTAIN',
  'COLONY': 'ผ้า CURTAIN',
  'COSTA': 'ผ้า CURTAIN',
  'FINITURA': 'ผ้า CURTAIN',
  'GARDENIA': 'ผ้า CURTAIN',
  'GRANULAR': 'ผ้า CURTAIN',
  'HYPER LINK': 'ผ้า CURTAIN',
  'IKAT': 'ผ้า CURTAIN',
  'ILLUSION': 'ผ้า CURTAIN',
  'INSIDER': 'ผ้า CURTAIN',
  'JACINTHA': 'ผ้า CURTAIN',
  'KOTABHARU': 'ผ้า CURTAIN',
  'KUSA': 'ผ้า CURTAIN',
  'LELOUVRE': 'ผ้า CURTAIN',
  'LICHEN': 'ผ้า CURTAIN',
  'LIQUOR': 'ผ้า CURTAIN',
  'LOLARY': 'ผ้า CURTAIN',
  'MALAGA': 'ผ้า CURTAIN',
  'MEDICINES': 'ผ้า CURTAIN',
  'MISU': 'ผ้า CURTAIN',
  'MOCKLINE': 'ผ้า CURTAIN',
  'MOONSTONE': 'ผ้า CURTAIN',
  'OPTICS': 'ผ้า CURTAIN',
  'ORBIT': 'ผ้า CURTAIN',
  'PENNY': 'ผ้า CURTAIN',
  'PEONY': 'ผ้า CURTAIN',
  'PERSEC': 'ผ้า CURTAIN',
  'PRINCIPE': 'ผ้า CURTAIN',
  'RIDDLE': 'ผ้า CURTAIN',
  'RIVERA': 'ผ้า CURTAIN',
  'SAVANNAH': 'ผ้า CURTAIN',
  'SCOTCH': 'ผ้า CURTAIN',
  'SERENADE': 'ผ้า CURTAIN',
  'SIMILAN': 'ผ้า CURTAIN',
  'SINGULAR': 'ผ้า CURTAIN',
  'STONEWALL': 'ผ้า CURTAIN',
  'TAKERIN': 'ผ้า CURTAIN',
  'THAILEAF': 'ผ้า CURTAIN',
  'TOPO': 'ผ้า CURTAIN',
  'TRINITY': 'ผ้า CURTAIN',
  'TRIRON': 'ผ้า CURTAIN',
  'TWINS': 'ผ้า CURTAIN',
  'VIVA': 'ผ้า CURTAIN',
  'WARP': 'ผ้า CURTAIN',
  'STARRY NIGHT': 'ผ้า CURTAIN',
  'WILD LIFE': 'ผ้า CURTAIN',
  'MERMAID': 'ผ้า CURTAIN',
  'SKY PARTY': 'ผ้า CURTAIN',
  'CRADLE': 'ผ้า CURTAIN',
  'BISCUIT': 'ผ้า CURTAIN',
  'SQUARE': 'ผ้า CURTAIN',
};

const STANDARD_CATEGORIES = [
  'ผ้า BLACKOUT',
  'ผ้า DIM OUT',
  'ผ้า DIM OUT & HEAT BLOCK',
  'ผ้า HEAT BLOCK',
  'ผ้า MULTI PURPOSE',
  'ผ้า UPHOLSTERY',
  'ผ้า SHEER',
  'ผ้า CURTAIN'
];

interface FabricCategoryReportViewProps {
  projects: Project[];
  customMappings: { [key: string]: string };
  onSaveMapping: (fabricName: string, category: string) => Promise<void>;
}

export default function FabricCategoryReportView({
  projects,
  customMappings,
  onSaveMapping
}: FabricCategoryReportViewProps) {
  const [editingCategories, setEditingCategories] = useState<{ [fabricName: string]: string }>({});
  const [savingFabric, setSavingFabric] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter for global category searching
  const [searchTerm, setSearchTerm] = useState('');

  // Sort settings for each category card
  const [sortField, setSortField] = useState<'yards' | 'sales'>('yards');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drilldown visual popup state
  const [drilldown, setDrilldown] = useState<{
    type: 'category' | 'fabric';
    title: string;
    category?: string;
    fabricName?: string;
    data: any;
    backCategory?: string; // To allow navigating back to its parent category in drilldown
  } | null>(null);

  // Format Helpers
  const formatCurrencyLocal = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumberLocal = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num || 0);
  };

  // Compile fabrics data and categorise them
  const processedData = useMemo(() => {
    const fabricAggregation: {
      [name: string]: {
        name: string;
        yards: number;
        qty: number;
        netTotal: number;
        projectsCount: number;
        resolvedCategory: string;
      };
    } = {};

    projects.forEach((p) => {
      // Keep track of fabrics seen in this project to increment project count only once per project-fabric pairing
      const seenFnames = new Set<string>();

      p.items.forEach((item) => {
        if (item.item_type === 'F' && item.fabric_name) {
          const fname = item.fabric_name.trim();
          const fnameUpp = fname.toUpperCase();

          const yards = item.qtyYards || item.qty;
          const netTotal = item.itemNetTotal || 0;

          if (!fabricAggregation[fname]) {
            // Determine Category
            let cat = 'ยังไม่ระบุประเภท';
            if (customMappings[fnameUpp]) {
              cat = customMappings[fnameUpp];
            } else if (PRE_DEFINED_FABRIC_CATEGORIES[fnameUpp]) {
              cat = PRE_DEFINED_FABRIC_CATEGORIES[fnameUpp];
            }

            fabricAggregation[fname] = {
              name: fname,
              yards: 0,
              qty: 0,
              netTotal: 0,
              projectsCount: 0,
              resolvedCategory: cat
            };
          }

          fabricAggregation[fname].yards += yards;
          fabricAggregation[fname].qty += item.qty;
          fabricAggregation[fname].netTotal += netTotal;

          if (!seenFnames.has(fnameUpp)) {
            seenFnames.add(fnameUpp);
            fabricAggregation[fname].projectsCount += 1;
          }
        }
      });
    });

    const list = Object.values(fabricAggregation);

    // Filter by global search
    const filteredList = searchTerm
      ? list.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : list;

    // Group by category
    const uncategorizedFabrics: typeof list = [];
    const grouped: { [category: string]: typeof list } = {};

    STANDARD_CATEGORIES.forEach((c) => {
      grouped[c] = [];
    });

    filteredList.forEach((f) => {
      if (f.resolvedCategory === 'ยังไม่ระบุประเภท') {
        uncategorizedFabrics.push(f);
      } else if (grouped[f.resolvedCategory]) {
        grouped[f.resolvedCategory].push(f);
      } else {
        // Fallback for custom added categories if any
        if (!grouped[f.resolvedCategory]) {
          grouped[f.resolvedCategory] = [];
        }
        grouped[f.resolvedCategory].push(f);
      }
    });

    // Sort function
    const sortList = (items: typeof list) => {
      return [...items].sort((a, b) => {
        const valA = sortField === 'yards' ? a.yards : a.netTotal;
        const valB = sortField === 'yards' ? b.yards : b.netTotal;
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
    };

    // Sort every group
    const sortedGrouped: { [category: string]: typeof list } = {};
    Object.keys(grouped).forEach((cat) => {
      sortedGrouped[cat] = sortList(grouped[cat]);
    });

    // Sort uncategorized as well
    const sortedUncategorized = uncategorizedFabrics.sort((a, b) => b.yards - a.yards);

    // Calculate sum metrics
    let totalYardsCalculated = list.reduce((sum, f) => sum + f.yards, 0);
    let totalRevenueCalculated = list.reduce((sum, f) => sum + f.netTotal, 0);

    // Calculate category ranking leaderboard elements
    const categoryLeaderboard = STANDARD_CATEGORIES.map(cat => {
      const catList = sortedGrouped[cat] || [];
      const yards = catList.reduce((sum, item) => sum + item.yards, 0);
      const revenue = catList.reduce((sum, item) => sum + item.netTotal, 0);
      const modelsCount = catList.length;

      return {
        category: cat,
        yards,
        revenue,
        modelsCount,
        fabrics: catList
      };
    }).sort((a, b) => {
      const valA = sortField === 'yards' ? a.yards : a.revenue;
      const valB = sortField === 'yards' ? b.yards : b.revenue;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return {
      allFabrics: list,
      uncategorized: sortedUncategorized,
      grouped: sortedGrouped,
      totalYards: totalYardsCalculated,
      totalRevenue: totalRevenueCalculated,
      categoryLeaderboard
    };
  }, [projects, customMappings, searchTerm, sortField, sortOrder]);

  // Handle Quick Custom Mapping sync
  const handleSaveCategory = async (fabricName: string) => {
    const selectedCat = editingCategories[fabricName];
    if (!selectedCat) {
      alert('กรุณาเลือกประเภทของผ้าก่อนทำการบันทึก');
      return;
    }

    setSavingFabric(fabricName);
    try {
      await onSaveMapping(fabricName, selectedCat);
      setSuccessMsg(`ระบบอัปเดตรุ่นผ้า "${fabricName}" เข้าหมวดจัดเก็บ "${selectedCat}" เรียบร้อยแล้ว!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      alert(`ไม่สามารถบันทึกได้: ${e.message || e}`);
    } finally {
      setSavingFabric(null);
    }
  };

  // 🔍 Opens a detailed modal detailing everything inside a Category
  const handleOpenCategoryDrilldown = (categoryName: string) => {
    const list = processedData.grouped[categoryName] || [];
    setDrilldown({
      type: 'category',
      title: `เจาะลึกกลุ่มวัตถุดิบ: ${categoryName}`,
      category: categoryName,
      data: {
        fabrics: list
      }
    });
  };

  // 🔍 Opens a detailed modal detailing everything inside a specific Fabric Model (usages, colors, projects)
  const handleOpenFabricDrilldown = (fabricName: string, backToCategoryName?: string) => {
    const usages: any[] = [];
    const colorSummary: { [color: string]: { yards: number; revenue: number; count: number } } = {};

    projects.forEach((p) => {
      p.items.forEach((item) => {
        if (item.item_type === 'F' && item.fabric_name && item.fabric_name.trim().toUpperCase() === fabricName.trim().toUpperCase()) {
          const colorName = (item.fabric_color || 'ไม่ระบุสี').trim();
          const yards = item.qtyYards || item.qty;
          const netTotal = item.itemNetTotal || 0;

          usages.push({
            quotation_no: p.quotation_no,
            customerName: p.customerName,
            confirm_date: p.confirm_date,
            province: p.province,
            room_name: item.room_name || 'ไม่ระบุห้อง',
            color: colorName,
            yards,
            netTotal
          });

          if (!colorSummary[colorName]) {
            colorSummary[colorName] = { yards: 0, revenue: 0, count: 0 };
          }
          colorSummary[colorName].yards += yards;
          colorSummary[colorName].revenue += netTotal;
          colorSummary[colorName].count += 1;
        }
      });
    });

    setDrilldown({
      type: 'fabric',
      title: `วิเคราะห์รุ่นผ้า: ${fabricName.toUpperCase()}`,
      fabricName,
      backCategory: backToCategoryName,
      data: {
        usages: usages.sort((a, b) => b.yards - a.yards),
        colors: Object.entries(colorSummary).map(([color, stats]) => ({ color, ...stats })).sort((a, b) => b.yards - a.yards)
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-16" id="fabric-category-report-root">
      
      {/* 🧭 Top Summary Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600 block shadow-xs shadow-indigo-600/5">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-800 tracking-tight">
                  รายงานแยกตามคุณสมบัติประเภทของผ้า (Material Properties Analytics)
                </h1>
                <p className="text-xs text-slate-550 font-semibold block leading-tight">
                  จัดสรรปริมาณการใช้ผ้า (หลา) และยอดจำหน่ายรวมแยกตามกลุ่มมาตรฐานของโรงงานผ้าม่านอย่างละเอียด
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto shrink-0">
            {/* Global search within categories */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 py-2 px-3 rounded-2xl w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหารุ่นผ้าในกลุ่ม..."
                className="bg-transparent text-xs text-slate-705 focus:outline-none w-full font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border rounded-2xl p-4 leading-normal hover:shadow-2xs transition-all">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">ความยาวหลาใช้งานรวม</span>
            <span className="text-xl font-black text-indigo-650 block mt-1">
              {formatNumberLocal(processedData.totalYards, 1)}{' '}
              <span className="text-xs font-bold text-slate-400">หลา</span>
            </span>
          </div>

          <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 leading-normal hover:shadow-2xs transition-all">
            <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider block">มูลค่าขายประกอบรวม (Baht)</span>
            <span className="text-xl font-black text-emerald-600 block mt-1">
              {formatCurrencyLocal(processedData.totalRevenue)}
            </span>
          </div>

          <div className="bg-white border hover:border-slate-300 rounded-2xl p-4 leading-normal hover:shadow-2xs transition-all col-span-2 md:col-span-1 lg:col-span-2">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">การตั้งค่าเรียงเรียงลำดับในกลุ่มประเภท</span>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSortField('yards')}
                  className={`text-[10.5px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    sortField === 'yards'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  จำนวนหลา
                </button>
                <button
                  onClick={() => setSortField('sales')}
                  className={`text-[10.5px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    sortField === 'sales'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-105 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ยอดขายสุทธิ
                </button>
              </div>

              <div className="h-4 border-l border-slate-200"></div>

              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-650 bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200 transition-all border border-slate-200"
              >
                <ArrowUpDown className="w-3.5 h-3.5 animate-pulse" />
                <span>{sortOrder === 'desc' ? 'เรียงจากมาก ➔ น้อย' : 'เรียงจากน้อย ➔ มาก'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Section: Best Selling Categories Leaderboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6" id="fabric-best-sellers-leaderboard">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500" />
              สรุปอันดับกลุ่มประเภทผ้าขายดีที่สุด (Best-Sellers Category Leaderboard Chart)
            </h2>
            <p className="text-xs text-slate-450 font-semibold block leading-tight mt-0.5">
              แผนภูมิเปรียบเทียบความต้องการสะสมแยกตามคุณสมบัติการทำงานของผ้า โดยจัดเรียงกลุ่มที่มียอดความต้องการสูงสุดลงมาแบบอัตโนมัติ
            </p>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 py-1.5 px-3 rounded-full font-black tracking-wide shrink-0">
            วิเคราะห์เปรียบเทียบ {STANDARD_CATEGORIES.length} หมวดผ้ามาตรฐาน
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Side: Modern Horizontal Bar Chart */}
          <div className="lg:col-span-7 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[385px]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10.5px] text-slate-400 font-extrabold uppercase tracking-wider block">
                แผนภูมิมุมมองสถิติสะสม ({sortField === 'yards' ? 'เรียงตามปริมาณใช้รวม: หลา' : 'เรียงตามมูลค่าขายรวม: บาท'})
              </span>
              <span className="text-[9.5px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md flex items-center gap-1 select-none">
                💡 คลิกที่แท่งกราฟเพื่อเจาะลึกดูรายการรุ่นผ้าในหมวด
              </span>
            </div>

            <div className="w-full flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={processedData.categoryLeaderboard}
                  layout="vertical"
                  margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={true}
                    stroke="#E2E8F0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={110}
                    tick={{ fontSize: 10.5, fill: '#334155', fontWeight: 800 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#F1F5F9', opacity: 0.6 }}
                    formatter={(value: any, name: string, props: any) => {
                      const item = props?.payload;
                      if (item) {
                        return [
                          <div key={item.category} className="space-y-1 font-sans text-xs">
                            <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 mb-1">{item.category}</p>
                            <p className="text-indigo-600 font-bold">ใช้รวม: {formatNumberLocal(item.yards, 2)} หลา</p>
                            <p className="text-emerald-600 font-bold">ยอดขายรวม: {formatCurrencyLocal(item.revenue)}</p>
                            <p className="text-slate-500">สัดส่วนในโรงงาน: {formatNumberLocal(processedData.totalYards > 0 ? (item.yards / processedData.totalYards) * 100 : 0, 1)}%</p>
                            <p className="text-slate-400 font-semibold">{item.modelsCount} รุ่นวัตถุดิบผ้า</p>
                          </div>,
                          ''
                        ];
                      }
                      return [value, name];
                    }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      padding: '12px'
                    }}
                  />
                  <Bar
                    dataKey={sortField === 'yards' ? 'yards' : 'revenue'}
                    radius={[0, 6, 6, 0]}
                    onClick={(data) => {
                      if (data && data.category) {
                        handleOpenCategoryDrilldown(data.category);
                      }
                    }}
                    className="cursor-pointer hover:opacity-95 transition-opacity"
                  >
                    {processedData.categoryLeaderboard.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColorHex(entry.category)} />
                    ))}
                    <LabelList
                      dataKey={sortField === 'yards' ? 'yards' : 'revenue'}
                      position="right"
                      formatter={(val: number) => sortField === 'yards' ? `${formatNumberLocal(val, 1)} หลา` : formatCurrencyLocal(val)}
                      style={{ fill: '#475569', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Side: Tabular Summary Leaderboard of the Sorted Categories with drilldown buttons */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10.5px] text-slate-400 font-extrabold uppercase tracking-wider block">
                ตารางสรุปอันดับการจำหน่าย (จัดเรียงเรียงลำดับจากมากไปน้อยจริง)
              </span>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {processedData.categoryLeaderboard.map((group, idx) => {
                  const pctOfTotal = processedData.totalYards > 0 ? (group.yards / processedData.totalYards) * 100 : 0;
                  const rankLabel = idx + 1;

                  // Define Rank Badge Colors
                  let badgeBg = 'bg-slate-100 text-slate-600';
                  let cardBorder = 'border-slate-100';
                  if (rankLabel === 1) {
                    badgeBg = 'bg-amber-500 text-white shadow-3xs';
                    cardBorder = 'border-amber-200 bg-amber-50/10';
                  } else if (rankLabel === 2) {
                    badgeBg = 'bg-slate-300 text-slate-800';
                    cardBorder = 'border-slate-200';
                  } else if (rankLabel === 3) {
                    badgeBg = 'bg-amber-700/80 text-white';
                    cardBorder = 'border-amber-100';
                  }

                  return (
                    <div
                      key={group.category}
                      onClick={() => handleOpenCategoryDrilldown(group.category)}
                      className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder} hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer group`}
                      title="คลิกเพื่อเจาะลึกดูรุ่นผ้าทั้งหมดในกลุ่มประเภทนี้"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md shrink-0 ${badgeBg}`}>
                          #{rankLabel}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${getCategoryDotColor(group.category)}`}></span>
                            <span className="text-[12px] font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {group.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {group.modelsCount} รุ่นวัตถุดิบ • สัดส่วน {formatNumberLocal(pctOfTotal, 1)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-[12px] font-extrabold text-slate-700 block">
                          {formatNumberLocal(group.yards, 1)}{' '}
                          <span className="text-[9.5px] font-normal text-slate-400">หลา</span>
                        </span>
                        <span className="text-[10px] text-emerald-650 font-bold block mt-0.5">
                          {formatCurrencyLocal(group.revenue)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 mt-4 flex items-center justify-between text-[10px] text-slate-505 font-extrabold uppercase">
              <span>ข้อมูลผูกเข้าประวัติสารบบ ERP</span>
              <span className="text-indigo-650 flex items-center gap-0.5 font-bold">
                คลิกรายการเพื่อเจาะลึกหมวดหมู่ <ArrowUpRight className="w-3.5 h-3.5 animate-bounce" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ Uncategorized Alert Banner and inline assignment interface */}
      {processedData.uncategorized.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-900 flex items-center gap-1.5 font-sans">
                ⚠️ มีเนื้อผ้ารุ่นใหม่ยังไม่ได้กำหนดจัดประเภทของผ้า ({processedData.uncategorized.length} รายการ)
              </h3>
              <p className="text-[11.5px] font-bold text-amber-700 leading-normal max-w-4xl mt-1">
                ตรวจพบวัตถุดิบผ้าที่ถูกนำเข้าจากโปรเจกต์ใบเสนอราคา แต่ยังไม่ได้ระบุประเภทกลุ่มผ้าหลักในระบบมาตรฐาน 
                กรุณาทำหารกำหนดระบุเลือกกลุ่มประเภทด้านล่างเพื่อทำการ **บันทึกออนไลน์ซิงค์เก็บขึ้นคลาวด์ร่วมกันทันที**
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in shadow-3xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick configure table */}
          <div className="bg-white border border-amber-150 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9.5px]">
                  <tr>
                    <th className="px-4 py-3">อันดับ</th>
                    <th className="px-4 py-3">ชื่อรุ่นผ้าใหม่</th>
                    <th className="px-4 py-3 text-right">จำนวนใช้หลาสะสม</th>
                    <th className="px-4 py-3 text-right">มูลค่ารวมสะสม</th>
                    <th className="px-4 py-3 text-center w-80">การกำหนดประเภทในระบบ</th>
                    <th className="px-4 py-3 text-center">ปฏิบัติการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  {processedData.uncategorized.map((f, i) => (
                    <tr key={f.name} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-800 text-[13px]">{f.name}</td>
                      <td className="px-4 py-3 text-right font-black text-rose-600">{formatNumberLocal(f.yards, 2)} หลา</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-500">{formatCurrencyLocal(f.netTotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={editingCategories[f.name] || ''}
                          onChange={(e) => {
                            setEditingCategories({
                              ...editingCategories,
                              [f.name]: e.target.value
                            });
                          }}
                          className="bg-slate-50 text-[11.5px] font-extrabold text-slate-700 rounded-xl p-2 border border-slate-250 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-full font-mono"
                        >
                          <option value="">-- เลือกจัดประเภทผ้า --</option>
                          {STANDARD_CATEGORIES.map((catOpt) => (
                            <option key={catOpt} value={catOpt}>
                              {catOpt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          disabled={savingFabric === f.name}
                          onClick={() => handleSaveCategory(f.name)}
                          className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-white shadow-xs transition-all cursor-pointer mx-auto ${
                            savingFabric === f.name
                              ? 'bg-amber-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-755 hover:shadow-sm'
                          }`}
                        >
                          <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
                          <span>{savingFabric === f.name ? 'กำลังซิงค์...' : 'บันทึก Cloud'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Section 2: Cards Grid for standard types of fabrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {STANDARD_CATEGORIES.map((c) => {
          const list = processedData.grouped[c] || [];
          const catSumYards = list.reduce((sum, item) => sum + item.yards, 0);
          const catSumRevenue = list.reduce((sum, item) => sum + item.netTotal, 0);

          return (
            <div 
              key={c}
              onDoubleClick={() => handleOpenCategoryDrilldown(c)} 
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-400/40 shadow-xs flex flex-col justify-between cursor-zoom-in transition-all select-none group"
              title="ดับเบิ้ลคลิกกลุ่มประเภทเพื่อดูรุ่นผ้าทั้งหมด"
            >
              <div>
                {/* Card Header information & summary indicators */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-2xl block text-white shadow-sm transition-all group-hover:scale-105 ${getCategoryBgClass(c)}`}>
                      <Compass className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 leading-tight uppercase group-hover:text-indigo-600 transition-colors">
                        {c}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                        รวมใช้จำหน่ายในกลุ่มนี้ {list.length} รุ่นสถิติ
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-850 block">
                      {formatNumberLocal(catSumYards, 1)} <span className="text-[10px] text-slate-400 font-bold">หลา</span>
                    </span>
                    <span className="text-[10.5px] text-emerald-650 font-black block mt-0.5">
                      {formatCurrencyLocal(catSumRevenue)}
                    </span>
                  </div>
                </div>

                {/* Listing fabrics categorized */}
                <div className="space-y-2.5 max-h-[385px] overflow-y-auto pr-1">
                  {list.length > 0 ? (
                    list.map((item, idx) => {
                      const percentageOfCat = catSumYards > 0 ? (item.yards / catSumYards) * 100 : 0;

                      return (
                        <div
                          key={item.name}
                          onDoubleClick={(e) => {
                            e.stopPropagation(); // Stop propagation so it doesn't trigger parent category card dblclick
                            handleOpenFabricDrilldown(item.name);
                          }}
                          className="bg-slate-50/65 hover:bg-indigo-50/40 border border-transparent hover:border-indigo-200/80 p-3.5 rounded-2xl transition-all cursor-zoom-in group/item relative select-none"
                          title="ดับเบิ้ลคลิกรุ่นผ้าเพื่อวิเคราะห์สีและโครงการ"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-slate-200 border border-slate-250 text-slate-600 font-black text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-md">
                                  {idx + 1}
                                </span>
                                <span className="text-[12.5px] font-bold text-slate-800 tracking-tight group-hover/item:text-indigo-650 transition-colors font-mono">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block">
                                ความนิยมอันดับ {idx + 1} • ปรากฏใน {item.projectsCount} ใบงานคลาวด์
                              </span>
                            </div>

                            <div className="text-right whitespace-nowrap">
                              <span className="text-[12.5px] font-black text-indigo-700 block">
                                {formatNumberLocal(item.yards, 2)} <span className="text-[10px] text-slate-400 font-bold">หลา</span>
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                                สุทธิ: {formatCurrencyLocal(item.netTotal)}
                              </span>
                            </div>
                          </div>

                          {/* Proportion progress bar */}
                          <div className="mt-2.5">
                            <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                              <span>สัดส่วนอุปสงค์ในกลุ่มผ้า</span>
                              <span className="text-[10px] text-indigo-600 font-bold">{formatNumberLocal(percentageOfCat, 1)}%</span>
                            </div>
                            <div className="w-full bg-slate-250 h-1 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentageOfCat}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${getProgressBgClass(c)}`}
                              ></div>
                            </div>
                          </div>

                          {/* Zoom Icon badge */}
                          <div className="absolute bottom-2.5 right-3 opacity-0 group-hover/item:opacity-100 transition-all flex items-center gap-0.5 text-[8.5px] font-black text-indigo-600 uppercase tracking-wider">
                            <span>วิเคราะห์สี</span>
                            <ArrowUpRight className="w-2.5 h-2.5 animate-pulse" />
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs py-12">
                      ไม่มีรายการรุ่นผ้าใช้งานในประวัติสารบบกลุ่มนี้ตามที่เลือกกรอง
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer Hint */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase">
                <span>สรุปหมวดหมู่ {c}</span>
                <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  ดับเบิ้ลคลิกเพื่อเจาะลึกกลุ่มคลังมีผ้า <ArrowUpRight className="w-3.5 h-3.5 inline" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =======================================================
          📊 DOUBLE CLICK DRILLDOWN MODAL POPUPS (INTERACTIVE DIALOGS)
          ======================================================= */}
      {drilldown && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-left pointer-events-auto animate-fade-in"
          onClick={() => setDrilldown(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col scale-100 transition-all"
            onClick={(e) => e.stopPropagation()} // Stop propagation inside the modal container
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl block text-white shadow-xs ${
                  drilldown.type === 'category' ? getCategoryBgClass(drilldown.category || '') : 'bg-indigo-650'
                }`}>
                  {drilldown.type === 'category' ? (
                    <FolderOpen className="w-5 h-5 text-white" />
                  ) : (
                    <Tag className="w-5 h-5 text-white animate-spin-slow" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-650">
                      {drilldown.type === 'category' ? 'วิเคราะห์กลุ่มผ้าและวัตถุดิบหลัก' : 'เจาะลึกข้อมูลรายรุ่นผ้า'}
                    </span>
                    {drilldown.backCategory && (
                      <button
                        onClick={() => handleOpenCategoryDrilldown(drilldown.backCategory!)}
                        className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                      >
                        ← ย้อนกลับกลุ่ม: {drilldown.backCategory}
                      </button>
                    )}
                  </div>
                  <h2 className="text-base font-black text-slate-800 mt-1">
                    {drilldown.title}
                  </h2>
                </div>
              </div>

              <button 
                onClick={() => setDrilldown(null)}
                className="bg-slate-150 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-2xl transition-all cursor-pointer shadow-3xs"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              
              {/* CONTENT FOR CATEGORY REPORT DRILLDOWN */}
              {drilldown.type === 'category' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-[11.5px] text-slate-600 leading-normal">
                      นี่คือรายการวัตถุดิบรุ่นผ้าของจริงที่จำแนกไว้ในหมวดหมู่ <strong>{drilldown.category}</strong> 
                      คุณสามารถคลิกที่ปุ่ม <strong className="text-indigo-650">เจาะลึกแบรนด์</strong> ในรุ่นนั้นๆ 
                      เพื่อวิเคราะห์อัตราเฉลี่ย ปริมาณความต้องการใช้แยกเป็นตามเฉดสี หรือดูใบงานเสนอราคาที่มีผ้ารุ่นนี้ประกอบอยู่อย่างละเอียด
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3">อันดับความนิยม</th>
                            <th className="px-4 py-3">รุ่นผ้าวัตถุดิบ</th>
                            <th className="px-4 py-3 text-right">จำนวนใช้หลารวม</th>
                            <th className="px-4 py-3 text-right">มูลค่ารวมสุทธิ</th>
                            <th className="px-4 py-3 text-center">สัดส่วนในกลุ่ม</th>
                            <th className="px-4 py-3 text-center">มิติเฉดสี/โครงการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700 font-mono">
                          {drilldown.data.fabrics.length > 0 ? (
                            drilldown.data.fabrics.map((item: any, idx: number) => {
                              const totalCategoryYards = drilldown.data.fabrics.reduce((sum: number, f: any) => sum + f.yards, 0);
                              const itemPct = totalCategoryYards > 0 ? (item.yards / totalCategoryYards) * 100 : 0;

                              return (
                                <tr key={item.name} className="hover:bg-slate-50/55">
                                  <td className="px-4 py-3 font-semibold text-slate-400 text-center">#{idx + 1}</td>
                                  <td className="px-4 py-3 font-black text-slate-800 text-[13px]">{item.name}</td>
                                  <td className="px-4 py-3 text-right font-black text-rose-600/90">{formatNumberLocal(item.yards, 2)} หลา</td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-600">{formatCurrencyLocal(item.netTotal)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-500">{formatNumberLocal(itemPct, 1)}%</span>
                                      <div className="w-16 bg-slate-150 h-1.5 rounded-full overflow-hidden block">
                                        <div 
                                          style={{ width: `${itemPct}%` }}
                                          className={`h-full rounded-full ${getProgressBgClass(drilldown.category || '')}`}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => handleOpenFabricDrilldown(item.name, drilldown.category)}
                                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-xl text-[10.5px] font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors cursor-pointer font-sans"
                                    >
                                      <span>วิเคราะห์เจาะลึก</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400 font-sans text-xs">
                                ไม่มีรุ่นผ้าจำแนกในกลุ่มนี้สำหรับการเลือกกรองปัจจุบัน
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT FOR FABRIC DRILLDOWN */}
              {drilldown.type === 'fabric' && (
                <div className="space-y-6">
                  
                  {/* Stats Summary Panel */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border rounded-2xl p-4">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">การใช้รวมทั้งหมด</span>
                      <span className="text-lg font-black text-indigo-650 block mt-1">
                        {formatNumberLocal(drilldown.data.usages.reduce((sum: number, u: any) => sum + u.yards, 0), 2)}{' '}
                        <span className="text-xs font-bold text-slate-400">หลา</span>
                      </span>
                    </div>

                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4">
                      <span className="text-[9.5px] font-bold text-emerald-700 uppercase tracking-wider block">ยอดจำหน่ายรวม</span>
                      <span className="text-lg font-black text-emerald-650 block mt-1">
                        {formatCurrencyLocal(drilldown.data.usages.reduce((sum: number, u: any) => sum + u.netTotal, 0))}
                      </span>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-4">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">จำนวนเฉดสีกระจายตัว</span>
                      <span className="text-lg font-black text-slate-800 block mt-1">
                        {drilldown.data.colors.length}{' '}
                        <span className="text-xs font-bold text-slate-400">สี</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-4">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">สถิติจำนวนโครงการใช้</span>
                      <span className="text-lg font-black text-indigo-600 block mt-1">
                        {new Set(drilldown.data.usages.map((u: any) => u.quotation_no)).size}{' '}
                        <span className="text-xs font-bold text-slate-400">ใบเสนอราคา</span>
                      </span>
                    </div>
                  </div>

                  {/* Dynamic split panels: Color breakdown vs Project history */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Color Breakdown List (Left) */}
                    <div className="lg:col-span-5 space-y-3">
                      <h3 className="text-xs font-black text-slate-800 block uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <span className="w-1.5 h-3 bg-indigo-600 rounded-full block"></span>
                        🎨 แยกปริมาณใช้ตามรหัสสี (Colorways)
                      </h3>

                      <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 space-y-4 max-h-[350px] overflow-y-auto">
                        {drilldown.data.colors.length > 0 ? (
                          drilldown.data.colors.map((c: any, index: number) => {
                            const totalFabYards = drilldown.data.usages.reduce((sum: number, u: any) => sum + u.yards, 0);
                            const colorPct = totalFabYards > 0 ? (c.yards / totalFabYards) * 100 : 0;

                            return (
                              <div key={index} className="space-y-1.5 leading-normal">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 bg-slate-350 border rounded-full inline-block"></span>
                                    {c.color}
                                  </span>
                                  <div className="text-right whitespace-nowrap">
                                    <span className="font-black text-indigo-700">{formatNumberLocal(c.yards, 2)} หลา</span>
                                    <span className="text-[10px] text-slate-400 font-medium block">
                                      ({c.count} รายการห้อง • {formatNumberLocal(colorPct, 1)}%)
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-205 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${colorPct}%` }}
                                    className="h-full bg-indigo-600 rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-slate-400 text-xs">
                            ไม่มีช่วงสถิติเฉดระบุไว้
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Historical project logs (Right) */}
                    <div className="lg:col-span-7 space-y-3">
                      <h3 className="text-xs font-black text-slate-800 block uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full block"></span>
                        📋 บัญชีโครงการที่มีผ้ารุ่นนี้ถูกเลือกใช้ ({drilldown.data.usages.length} รายการ)
                      </h3>

                      <div className="border border-slate-150 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto bg-white shadow-3xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider sticky top-0">
                            <tr>
                              <th className="px-3 py-2.5">ใบเสนอราคา</th>
                              <th className="px-3 py-2.5">ชื่อลูกค้า / จังหวัด</th>
                              <th className="px-3 py-2.5">ห้อง / รหัสสี</th>
                              <th className="px-3 py-2.5 text-right">จำนวน</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px] text-slate-700">
                            {drilldown.data.usages.map((u: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2.5 font-bold text-slate-500">{u.quotation_no}</td>
                                <td className="px-3 py-2.5 leading-tight">
                                  <span className="font-extrabold text-slate-850 block font-sans">{u.customerName}</span>
                                  <span className="text-[10px] text-slate-400 block font-sans">{u.province || 'ไม่ระบุจังหวัด'}</span>
                                </td>
                                <td className="px-3 py-2.5 leading-tight">
                                  <span className="font-semibold block text-slate-600 font-sans">{u.room_name}</span>
                                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm inline-block mt-0.5 font-extrabold">
                                    {u.color}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right whitespace-nowrap leading-tight">
                                  <span className="font-black text-rose-600 block">{formatNumberLocal(u.yards, 2)} หลา</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{formatCurrencyLocal(u.netTotal)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer block */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="font-sans">
                CurtainPro ERP • ระบบประมวลผลความนิยมผ้าและคลังวัตถุดิบความแม่นยำสูง
              </span>
              <button
                onClick={() => setDrilldown(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer font-sans"
              >
                เสร็จสิ้น
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Helpers to style colors by category
function getCategoryColorHex(category: string) {
  switch (category) {
    case 'ผ้า BLACKOUT':
      return '#0f172a'; // slate-900
    case 'ผ้า DIM OUT':
      return '#4f46e5'; // indigo-600
    case 'ผ้า DIM OUT & HEAT BLOCK':
      return '#2563eb'; // blue-600
    case 'ผ้า HEAT BLOCK':
      return '#e11d48'; // rose-600
    case 'ผ้า MULTI PURPOSE':
      return '#d97706'; // amber-600
    case 'ผ้า UPHOLSTERY':
      return '#9333ea'; // purple-600
    case 'ผ้า SHEER':
      return '#0d9488'; // teal-600
    case 'ผ้า CURTAIN':
      return '#0891b2'; // cyan-600
    default:
      return '#4f46e5';
  }
}

function getCategoryBgClass(category: string) {
  switch (category) {
    case 'ผ้า BLACKOUT':
      return 'bg-slate-900';
    case 'ผ้า DIM OUT':
      return 'bg-indigo-600';
    case 'ผ้า DIM OUT & HEAT BLOCK':
      return 'bg-blue-600';
    case 'ผ้า HEAT BLOCK':
      return 'bg-rose-600';
    case 'ผ้า MULTI PURPOSE':
      return 'bg-amber-600';
    case 'ผ้า UPHOLSTERY':
      return 'bg-purple-600';
    case 'ผ้า SHEER':
      return 'bg-teal-600';
    case 'ผ้า CURTAIN':
      return 'bg-cyan-600';
    default:
      return 'bg-indigo-600';
  }
}

function getProgressBgClass(category: string) {
  switch (category) {
    case 'ผ้า BLACKOUT':
      return 'bg-slate-800';
    case 'ผ้า DIM OUT':
      return 'bg-indigo-600';
    case 'ผ้า DIM OUT & HEAT BLOCK':
      return 'bg-blue-600';
    case 'ผ้า HEAT BLOCK':
      return 'bg-rose-600';
    case 'ผ้า MULTI PURPOSE':
      return 'bg-amber-600';
    case 'ผ้า UPHOLSTERY':
      return 'bg-purple-600';
    case 'ผ้า SHEER':
      return 'bg-teal-600';
    case 'ผ้า CURTAIN':
      return 'bg-cyan-600';
    default:
      return 'bg-indigo-600';
  }
}

function getCategoryDotColor(category: string) {
  switch (category) {
    case 'ผ้า BLACKOUT':
      return 'bg-slate-950';
    case 'ผ้า DIM OUT':
      return 'bg-indigo-600';
    case 'ผ้า DIM OUT & HEAT BLOCK':
      return 'bg-blue-600';
    case 'ผ้า HEAT BLOCK':
      return 'bg-rose-600';
    case 'ผ้า MULTI PURPOSE':
      return 'bg-amber-600';
    case 'ผ้า UPHOLSTERY':
      return 'bg-purple-600';
    case 'ผ้า SHEER':
      return 'bg-teal-600';
    case 'ผ้า CURTAIN':
      return 'bg-cyan-600';
    default:
      return 'bg-indigo-600';
  }
}
