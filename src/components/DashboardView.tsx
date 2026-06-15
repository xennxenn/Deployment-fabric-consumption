/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2,
  Package,
  PieChart as PieChartIcon,
  Scissors,
  PenTool,
  LayoutGrid,
  X,
  MapPin,
  TrendingUp,
  UserCheck,
  Search,
  Calendar,
  HelpCircle,
  Info,
  ChevronRight,
  Calculator,
  Coins
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { Project, ProjectItem } from '../types';
import StatCard from './StatCard';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatNumber = (num: number, decimals: number = 0) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num || 0);
};

const getProjectDateParsed = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year > 2400) year -= 543; // Convert Buddhist Era to AD if applicable
    return new Date(year, month, day);
  }
  return null;
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

// Sheer Fabric List provided by user
const SHEER_FABRICS = [
  'ARDOR-330', 'BLISS-330', 'FIDELITY-330', 'NIFTY-330', 'ARDOR', 'BLISS',
  'FIDELITY', 'MORNING', 'NIFTY', 'CLASSIC-AM', 'ONESTO', 'ROUTE', 'SACHET',
  'SEDIMI', 'SPA', 'SPICY', 'BLEARY', 'GLOSSIE', 'HYBRID', 'SEINE', 'TRAMMEL',
  'AMI', 'JUNO', 'WAFTY', 'AFFINITY', 'EZY', 'FILA', 'FLAG', 'FLAP', 'GALENA',
  'GALLEON', 'GOOD LUCK', 'MARCEL', 'MILD', 'DISCO', 'GLASSY', 'INFINITE',
  'LIBERTY', 'CANARI', 'HORIZON'
].map(f => f.toUpperCase());

const MONTH_NAMES = [
  { value: 0, label: 'มกราคม' },
  { value: 1, label: 'กุมภาพันธ์' },
  { value: 2, label: 'มีนาคม' },
  { value: 3, label: 'เมษายน' },
  { value: 4, label: 'พฤษภาคม' },
  { value: 5, label: 'มิถุนายน' },
  { value: 6, label: 'กรกฎาคม' },
  { value: 7, label: 'สิงหาคม' },
  { value: 8, label: 'กันยายน' },
  { value: 9, label: 'ตุลาคม' },
  { value: 10, label: 'พฤศจิกายน' },
  { value: 11, label: 'ธันวาคม' }
];

const YEAR_OPTIONS = [2023, 2024, 2025, 2026, 2027];

interface DashboardViewProps {
  projects: Project[];
}

export default function DashboardView({ projects }: DashboardViewProps) {
  // Date Filters State (Initializes dynamically based on project data range)
  const [startMonth, setStartMonth] = useState<number>(0);
  const [startYear, setStartYear] = useState<number>(2025);
  const [endMonth, setEndMonth] = useState<number>(11);
  const [endYear, setEndYear] = useState<number>(2026);
  const [initializedRange, setInitializedRange] = useState(false);

  // Search Filter for fabrics ranking
  const [fabricSearch, setFabricSearch] = useState('');

  // Estimator State
  const [targetRevenue, setTargetRevenue] = useState<number>(100000);

  // Drilldown Modal State
  const [drilldown, setDrilldown] = useState<{
    type: 'projects' | 'fabric_contrib' | 'sewing_contrib' | 'accessory_contrib' | 'employee_detail' | 'province_detail' | 'colors';
    title: string;
    data: any;
  } | null>(null);

  // Auto-initialize filters range based on input dataset
  useEffect(() => {
    if (projects.length > 0 && !initializedRange) {
      const dates = projects
        .map(p => getProjectDateParsed(p.confirm_date))
        .filter((d): d is Date => d !== null);
      if (dates.length > 0) {
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
        const minD = sortedDates[0];
        const maxD = sortedDates[sortedDates.length - 1];
        setStartMonth(minD.getMonth());
        setStartYear(minD.getFullYear());
        setEndMonth(maxD.getMonth());
        setEndYear(maxD.getFullYear());
        setInitializedRange(true);
      }
    }
  }, [projects, initializedRange]);

  // 1. FILTER PROJECTS BASED ON CHOSEN RANGES
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const pDate = getProjectDateParsed(p.confirm_date);
      if (!pDate) return true; // keep if no date
      const pYear = pDate.getFullYear();
      const pMonth = pDate.getMonth();
      
      const minComp = startYear * 12 + startMonth;
      const maxComp = endYear * 12 + endMonth;
      const currentComp = pYear * 12 + pMonth;
      
      return currentComp >= minComp && currentComp <= maxComp;
    });
  }, [projects, startMonth, startYear, endMonth, endYear]);

  // 1.5 MEMOIZE HEAVY METRICS COMPUTATION TO SPEED UP SEARCH TYPING
  const metrics = React.useMemo(() => {
    const projectCount = filteredProjects.length || 1;
    let totalNetSales = 0;
    let totalF = 0;
    let totalP = 0;
    let totalA = 0;

    // Split fabric yards to count them properly
    let totalNormalFabricYards = 0;
    let totalWideBlackoutFabricYards = 0;
    let totalWideSheerFabricYards = 0;
    let totalBlindsSqm = 0;
    let totalBlindsSets = 0;

    const fabricMap: { 
      [key: string]: { 
        totalYards: number; 
        totalNetTotal: number; 
        colors: { [key: string]: { yards: number; netTotal: number } } 
      } 
    } = {};
    
    const provinceMap: { [key: string]: { sales: number; count: number } } = {};
    const employeeMap: { [key: string]: { sales: number; count: number } } = {};

    // For Drilldowns mappings
    const empFabricMap: { [empName: string]: { [fabricName: string]: { yards: number, qty: number, netTotal: number } } } = {};
    const empProjectList: { [empName: string]: Project[] } = {};

    const provFabricMap: { [provName: string]: { [fabricName: string]: { yards: number, qty: number, netTotal: number } } } = {};
    const provProjectList: { [provName: string]: Project[] } = {};

    filteredProjects.forEach((p) => {
      totalNetSales += p.netTotal;
      totalF += p.total_F || 0;
      totalP += p.total_P || 0;
      totalA += p.total_A || 0;

      const prov = p.province || 'ไม่ระบุ';
      if (!provinceMap[prov]) provinceMap[prov] = { sales: 0, count: 0 };
      provinceMap[prov].sales += p.netTotal;
      provinceMap[prov].count += 1;

      if (!provProjectList[prov]) provProjectList[prov] = [];
      provProjectList[prov].push(p);

      const emp = (p.sale_id && p.sale_id.split('(')[0].trim()) || 'ไม่ระบุพนักงาน';
      if (!employeeMap[emp]) employeeMap[emp] = { sales: 0, count: 0 };
      employeeMap[emp].sales += p.netTotal;
      employeeMap[emp].count += 1;

      if (!empProjectList[emp]) empProjectList[emp] = [];
      empProjectList[emp].push(p);

      p.items.forEach((item) => {
        const isFabricComponent = item.item_type === 'F';
        if (isFabricComponent) {
          const yards = item.qtyYards || item.qty;
          const fabricNodeUpper = item.fabric_name ? item.fabric_name.toUpperCase() : '';
          const isWide = WIDE_FABRICS.includes(fabricNodeUpper) || item.is_wide;
          const isSheer = SHEER_FABRICS.includes(fabricNodeUpper);

          if (isSheer) {
            totalWideSheerFabricYards += yards;
          } else if (isWide) {
            totalWideBlackoutFabricYards += yards;
          } else {
            totalNormalFabricYards += yards;
          }

          if (item.fabric_name) {
            const fname = item.fabric_name;
            if (!fabricMap[fname]) {
              fabricMap[fname] = { totalYards: 0, totalNetTotal: 0, colors: {} };
            }
            fabricMap[fname].totalYards += yards;
            fabricMap[fname].totalNetTotal += (item.itemNetTotal || 0);

            const fcolor = item.fabric_color || 'ไม่ระบุสี';
            if (!fabricMap[fname].colors[fcolor]) {
              fabricMap[fname].colors[fcolor] = { yards: 0, netTotal: 0 };
            }
            fabricMap[fname].colors[fcolor].yards += yards;
            fabricMap[fname].colors[fcolor].netTotal += (item.itemNetTotal || 0);

            // Employee Fabric Mapping
            if (!empFabricMap[emp]) empFabricMap[emp] = {};
            if (!empFabricMap[emp][fname]) empFabricMap[emp][fname] = { yards: 0, qty: 0, netTotal: 0 };
            empFabricMap[emp][fname].yards += yards;
            empFabricMap[emp][fname].qty += item.qty;
            empFabricMap[emp][fname].netTotal += item.itemNetTotal || 0;

            // Province Fabric Mapping
            if (!provFabricMap[prov]) provFabricMap[prov] = {};
            if (!provFabricMap[prov][fname]) provFabricMap[prov][fname] = { yards: 0, qty: 0, netTotal: 0 };
            provFabricMap[prov][fname].yards += yards;
            provFabricMap[prov][fname].qty += item.qty;
            provFabricMap[prov][fname].netTotal += item.itemNetTotal || 0;
          }
        }

        const isBlind =
          (item.item_type === 'P' || item.item_type === 'A') &&
          (item.descriptions.includes('ม้วน') || item.descriptions.includes('มู่ลี่'));
        if (isBlind) {
          totalBlindsSqm += item.qty;
          totalBlindsSets += 1;
        }
      });
    });

    const totalFabricYards = totalNormalFabricYards + totalWideBlackoutFabricYards + totalWideSheerFabricYards;

    // Best selling fabric models (NO slice count limit as requested)
    const topFabricsOriginal = Object.entries(fabricMap)
      .map(([name, data]) => ({
        name,
        yards: data.totalYards,
        netTotal: data.totalNetTotal,
        colors: data.colors
      }))
      .sort((a, b) => b.yards - a.yards);

    const provinceData = Object.entries(provinceMap)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        count: data.count
      }))
      .sort((a, b) => b.sales - a.sales);

    const employeeData = Object.entries(employeeMap)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        count: data.count
      }))
      .sort((a, b) => b.sales - a.sales);

    return {
      projectCount,
      totalNetSales,
      totalF,
      totalP,
      totalA,
      totalNormalFabricYards,
      totalWideBlackoutFabricYards,
      totalWideSheerFabricYards,
      totalBlindsSqm,
      totalBlindsSets,
      fabricMap,
      provinceMap,
      employeeMap,
      empFabricMap,
      empProjectList,
      provFabricMap,
      provProjectList,
      totalFabricYards,
      topFabricsOriginal,
      provinceData,
      employeeData
    };
  }, [filteredProjects]);

  const {
    projectCount,
    totalNetSales,
    totalF,
    totalP,
    totalA,
    totalNormalFabricYards,
    totalWideBlackoutFabricYards,
    totalWideSheerFabricYards,
    totalBlindsSqm,
    totalBlindsSets,
    fabricMap,
    provinceMap,
    employeeMap,
    empFabricMap,
    empProjectList,
    provFabricMap,
    provProjectList,
    totalFabricYards,
    topFabricsOriginal,
    provinceData,
    employeeData
  } = metrics;

  // Search filtered fabrics (re-evaluates only when search query or pre-computed data changes)
  const topFabrics = React.useMemo(() => {
    return fabricSearch
      ? topFabricsOriginal.filter(f => f.name.toLowerCase().includes(fabricSearch.toLowerCase()))
      : topFabricsOriginal;
  }, [topFabricsOriginal, fabricSearch]);

  // Handle Double Clicks on Columns or Rows
  const triggerFabricColorDrilldown = (fabricName: string, colors: any, total: number, totalNetTotal: number) => {
    const colorArr = Object.entries(colors)
      .map(([colorName, colorData]: any) => ({
        colorName,
        yards: colorData.yards as number,
        netTotal: colorData.netTotal as number
      }))
      .sort((a, b) => b.yards - a.yards);

    setDrilldown({
      type: 'colors',
      title: `ชุดสีของรุ่นผ้า: ${fabricName}`,
      data: { name: fabricName, colors: colorArr, total, totalNetTotal }
    });
  };

  const triggerEmployeeDrilldown = (empName: string) => {
    const fabrics = Object.entries(empFabricMap[empName] || {})
      .map(([fname, fData]: [string, any]) => ({
        name: fname,
        yards: fData.yards,
        qty: fData.qty,
        netTotal: fData.netTotal
      }))
      .sort((a, b) => b.yards - a.yards);

    setDrilldown({
      type: 'employee_detail',
      title: `รายละเอียดรุ่นผ้าและงานที่ปิดการขาย: ${empName}`,
      data: {
        employeeName: empName,
        fabrics,
        projects: empProjectList[empName] || [],
        salesSum: employeeMap[empName]?.sales || 0,
        projCount: employeeMap[empName]?.count || 0
      }
    });
  };

  const triggerProvinceDrilldown = (provName: string) => {
    const fabrics = Object.entries(provFabricMap[provName] || {})
      .map(([fname, fData]: [string, any]) => ({
        name: fname,
        yards: fData.yards,
        qty: fData.qty,
        netTotal: fData.netTotal
      }))
      .sort((a, b) => b.yards - a.yards);

    setDrilldown({
      type: 'province_detail',
      title: `วิเคราะห์ความต้องการและการขยายตัว: จังหวัด ${provName}`,
      data: {
        provinceName: provName,
        fabrics,
        projects: provProjectList[provName] || [],
        salesSum: provinceMap[provName]?.sales || 0,
        projCount: provinceMap[provName]?.count || 0
      }
    });
  };

  // Drilled Down modals for standard KPI heads
  const triggerProjectsListDrilldown = () => {
    setDrilldown({
      type: 'projects',
      title: 'ทำเนียบโครงการสั่งผลิตทั้งหมดในขอบเขตตัวเลือก',
      data: filteredProjects
    });
  };

  const triggerFabricItemsDrilldown = () => {
    const allFabrics = Object.entries(fabricMap)
      .map(([name, data]: [string, any]) => {
        const isWide = WIDE_FABRICS.includes(name.toUpperCase());
        const isSheer = SHEER_FABRICS.includes(name.toUpperCase());
        let categoryName = 'ผ้าปกติ';
        if (isSheer) categoryName = 'ผ้าม่านโปร่งหน้ากว้าง';
        else if (isWide) categoryName = 'ผ้าม่านทึบหน้ากว้าง';

        return {
          name,
          category: categoryName,
          yards: data.totalYards,
          netTotal: data.totalNetTotal,
          colorsCount: Object.keys(data.colors).length
        };
      })
      .sort((a, b) => b.yards - a.yards);

    setDrilldown({
      type: 'fabric_contrib',
      title: 'สรุปรายการเนื้อผ้า และปริมาณจำหน่าย',
      data: allFabrics
    });
  };

  const triggerSewingBreakdownDrilldown = () => {
    const itemsList: { desc: string; room: string; qty: number; unit: string; total: number; quotationNo: string; customer: string }[] = [];
    filteredProjects.forEach(p => {
      p.items.forEach(item => {
        if (item.item_type === 'P') {
          itemsList.push({
            desc: item.descriptions,
            room: item.room_name || 'ไม่ระบุ',
            qty: item.qty,
            unit: item.unit || 'ชุด',
            total: item.itemNetTotal || 0,
            quotationNo: p.quotation_no,
            customer: p.customerName
          });
        }
      });
    });

    setDrilldown({
      type: 'sewing_contrib',
      title: 'เจาะลึกรายการคำนวณและค่าบริการตัดเย็บ (P)',
      data: itemsList.sort((a, b) => b.total - a.total)
    });
  };

  const triggerAccessoriesBreakdownDrilldown = () => {
    const itemsList: { desc: string; room: string; qty: number; unit: string; total: number; quotationNo: string; customer: string }[] = [];
    filteredProjects.forEach(p => {
      p.items.forEach(item => {
        if (item.item_type === 'A') {
          itemsList.push({
            desc: item.descriptions,
            room: item.room_name || 'ไม่ระบุ',
            qty: item.qty,
            unit: item.unit || 'ชิ้น',
            total: item.itemNetTotal || 0,
            quotationNo: p.quotation_no,
            customer: p.customerName
          });
        }
      });
    });

    setDrilldown({
      type: 'accessory_contrib',
      title: 'เจาะลึกอุปกรณ์ประกอบ และรางม่านมู่ลี่ (A)',
      data: itemsList.sort((a, b) => b.total - a.total)
    });
  };

  // Calculate dynamic fabric ratios from loaded/sorted projects
  const normRatio = totalNetSales > 0 ? (totalNormalFabricYards / totalNetSales) : (127 / 100000);
  const wideBlackRatio = totalNetSales > 0 ? (totalWideBlackoutFabricYards / totalNetSales) : (100 / 100000);
  const wideShRatio = totalNetSales > 0 ? (totalWideSheerFabricYards / totalNetSales) : (27 / 100000);

  const estimatedNormal = targetRevenue * normRatio;
  const estimatedWideBlackout = targetRevenue * wideBlackRatio;
  const estimatedWideSheer = targetRevenue * wideShRatio;
  const estimatedTotal = estimatedNormal + estimatedWideBlackout + estimatedWideSheer;

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-view-root">
      
      {/* 📅 Section 0: Interactive Date Range Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-2xl text-indigo-600">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">ตัวเลือกช่วงเวลาดำเนินการ (Date Range Filter)</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">กรองเพื่อดูสถิติ บันทึกการใช้ผ้า ยอดขาย และรายงานแยกตามพนักงาน</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Start Panel */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 shrink-0">
              <span className="text-[10px] font-black text-slate-400 px-2.5">เริ่มต้น:</span>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value, 10))}
                className="bg-white text-xs font-bold text-slate-700 rounded-lg p-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {MONTH_NAMES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
                className="bg-white text-xs font-bold text-slate-700 rounded-lg p-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />

            {/* End Panel */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 shrink-0">
              <span className="text-[10px] font-black text-slate-400 px-2.5">สิ้นสุด:</span>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(parseInt(e.target.value, 10))}
                className="bg-white text-xs font-bold text-slate-700 rounded-lg p-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {MONTH_NAMES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                className="bg-white text-xs font-bold text-slate-700 rounded-lg p-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (projects.length > 0) {
                  const dates = projects
                    .map(p => getProjectDateParsed(p.confirm_date))
                    .filter((d): d is Date => d !== null);
                  if (dates.length > 0) {
                    const sortedDates = [...dates].sort((a,b) => a.getTime() - b.getTime());
                    setStartMonth(sortedDates[0].getMonth());
                    setStartYear(sortedDates[0].getFullYear());
                    setEndMonth(sortedDates[sortedDates.length - 1].getMonth());
                    setEndYear(sortedDates[sortedDates.length - 1].getFullYear());
                  }
                }
              }}
              className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              title="รีเซ็ตกลับเป็นเวลาเริ่มต้นที่มีข้อมูลชุดแรกถึงล่าสุด"
            >
              แสดงข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Section 1: Net Sales Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" /> สรุปมูลค่าโครงการจำหน่ายและการดำเนินงานหลัก (KPI Cards)
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full border border-slate-200 select-none">
            💡 ดับเบิ้ลคลิก/คลิกที่การ์ด เพื่อขุดเจาะดูข้อมูลดิบ
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="โครงการทั้งหมด"
            value={`${formatNumber(filteredProjects.length)} รายการ`}
            icon={LayoutGrid}
            bgColorClass="bg-slate-900"
            colorClass="text-white"
            subtitle={`เฉลี่ยต่อโครงการ ${formatCurrency(totalNetSales / projectCount)}`}
            onDoubleClick={triggerProjectsListDrilldown}
          />
          <StatCard
            title="ค่าวัสดุผ้า (F)"
            value={formatCurrency(totalF)}
            icon={PieChartIcon}
            bgColorClass="bg-indigo-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalF / (totalNetSales || 1)) * 100, 1)}% ของยอดขายสุทธิ`}
            onDoubleClick={triggerFabricItemsDrilldown}
          />
          <StatCard
            title="ค่าตัดเย็บ & บริการ (P)"
            value={formatCurrency(totalP)}
            icon={Scissors}
            bgColorClass="bg-blue-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalP / (totalNetSales || 1)) * 100, 1)}% ของยอดขายสุทธิ`}
            onDoubleClick={triggerSewingBreakdownDrilldown}
          />
          <StatCard
            title="ค่าราง & อุปกรณ์ (A)"
            value={formatCurrency(totalA)}
            icon={PenTool}
            bgColorClass="bg-amber-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalA / (totalNetSales || 1)) * 100, 1)}% ของยอดขายสุทธิ`}
            onDoubleClick={triggerAccessoriesBreakdownDrilldown}
          />
          <StatCard
            title="จำนวนผ้าทั้งหมด"
            value={`${formatNumber(totalFabricYards, 1)} หลา`}
            icon={Package}
            bgColorClass="bg-emerald-600"
            colorClass="text-white"
            subtitle={`เฉลี่ยโครงการละ ${formatNumber(totalFabricYards / projectCount, 1)} หลา`}
            onDoubleClick={triggerFabricItemsDrilldown}
          />
        </div>
      </div>

      {/* 📦 Section 2: Production Average per Project (Splitted Wide Fabrics) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-500" /> สรุปอัตราส่วนเฉลี่ยการใช้วัตถุดิบจริงต่อโครงการ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm hover:border-slate-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                ผ้าผืนปกติหน้าแคบ / สีพื้น (Normal Fabric)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalNormalFabricYards / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">หลา / งาน</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                ปริมาณขายสะสม {formatNumber(totalNormalFabricYards, 1)} หลา
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <PieChartIcon className="text-indigo-600 w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm hover:border-slate-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                ผ้าม่านทึบหน้ากว้าง (Wide Blackout)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalWideBlackoutFabricYards / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">หลา / งาน</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                ปริมาณขายสะสม {formatNumber(totalWideBlackoutFabricYards, 1)} หลา
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center shrink-0">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm hover:border-slate-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                ผ้าม่านโปร่งหน้ากว้าง (Wide Sheer)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalWideSheerFabricYards / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">หลา / งาน</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                ปริมาณขายสะสม {formatNumber(totalWideSheerFabricYards, 1)} หลา
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
              <TrendingUp className="text-teal-600 w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm hover:border-slate-200 transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                ม่านม้วน / มู่ลี่สำเร็จรูป (Blinds Area)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalBlindsSqm / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-450">ตร.ม. / งาน</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                เฉลี่ย {formatNumber(totalBlindsSets / projectCount, 1)} ชุดต่อโครงการ
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center shrink-0">
              <LayoutGrid className="text-cyan-600 w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* 🔮 Section 1.5: Dynamic Estimation Tools (เครื่องประเมินเบื้องต้น) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-2xl">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-md font-extrabold text-white tracking-wide">
                เครื่องมือประเมินความต้องการใช้วัตถุดิบผ้าอัตโนมัติ (Dynamic Fabric Estimation)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              ระบบวิเคราะห์ข้อมูลจากสถิติโครงการสั่งตัดจริงในช่วงเวลาที่คุณเลือกปัจจุบัน อัตรารายรับสุทธิ 
              <span className="font-extrabold text-emerald-400 ml-1">100,000 บาท</span> จะใช้วัตถุดิบผ้าปกติเฉลี่ย 
              <span className="font-bold text-indigo-300 mx-1">{formatNumber(normRatio * 100000, 1)} หลา</span>, 
              ทึบหน้ากว้าง <span className="font-bold text-indigo-300 mx-1">{formatNumber(wideBlackRatio * 100000, 1)} หลา</span> 
              และโปร่งหน้ากว้าง <span className="font-bold text-indigo-300 mx-1">{formatNumber(wideShRatio * 100000, 1)} หลา</span>
            </p>
            <div className="pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                กำหนดเป้าหมายมูลค่ายอดจำหน่ายที่คาดคะเน (ระบุจำหน่ายเป็นบาท):
              </label>
              <div className="flex items-center gap-2 max-w-xs bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                <Coins className="w-4 h-4 text-amber-400 ml-2.5 shrink-0" />
                <input
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="เช่น 100,000"
                  className="bg-transparent text-sm text-white font-extrabold focus:outline-none w-full px-1"
                />
                <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-700/60 rounded-md">บาท</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[10px] font-black text-indigo-300 uppercase block tracking-wider mb-2">ผ้าปกติ (Normal)</span>
              <div>
                <p className="text-xl font-black text-white">{formatNumber(estimatedNormal, 1)}</p>
                <span className="text-[10px] font-bold text-slate-400">หลา</span>
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[10px] font-black text-blue-300 uppercase block tracking-wider mb-2">ม่านทึบหน้ากว้าง</span>
              <div>
                <p className="text-xl font-black text-white">{formatNumber(estimatedWideBlackout, 1)}</p>
                <span className="text-[10px] font-bold text-slate-400">หลา</span>
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[10px] font-black text-teal-300 uppercase block tracking-wider mb-2">ม่านโปร่งหน้ากว้าง</span>
              <div>
                <p className="text-xl font-black text-white">{formatNumber(estimatedWideSheer, 1)}</p>
                <span className="text-[10px] font-bold text-slate-400">หลา</span>
              </div>
            </div>

            <div className="bg-indigo-900/60 p-4 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-black text-emerald-300 uppercase block tracking-wider mb-2">ความต้องการใช้อุปสงค์รวม</span>
              <div>
                <p className="text-xl font-black text-emerald-400">{formatNumber(estimatedTotal, 1)}</p>
                <span className="text-[10px] font-extrabold text-slate-300">หลารวมทั้งหมด</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 📊 Section 3: Unlimited Best Selling Fabrics List & Chart */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-805 flex items-center gap-1.5">
              <Package className="w-5 h-5 text-indigo-650" /> ทำเนียบสถิติมูลค่าและประเภทเนื้อผ้าจำหน่ายทั้งหมด
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">รวมเนื้อผ้าจำหน่ายทั้งหมดเรียงลำดับจากความยาวหลาสูงสุดไปต่ำสุดแบบไม่มีจำกัดข้อมูล</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-2xl w-full md:w-60">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="พิมพ์ชื่อรุ่นผ้าเพื่อค้นหา..."
                className="bg-transparent text-xs text-slate-705 focus:outline-none w-full"
                value={fabricSearch}
                onChange={(e) => setFabricSearch(e.target.value)}
              />
              {fabricSearch && (
                <button onClick={() => setFabricSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 px-3 py-1.5 rounded-full shadow-2xs select-none">
              💡 ดับเบิ้ลคลิกแถวรุ่นผ้าเพื่อวิเคราะห์สีสะสม
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Chart Wrapper with internal scrollbar to support unbounded fabric sizes gracefully */}
          <div className="bg-slate-50/40 rounded-2xl border border-slate-100 p-4">
            <span className="text-[10px] text-slate-400 font-bold block mb-3 uppercase tracking-wider">
              แผนภูมิสัดส่วนความนิยมหลัก (แสดง {topFabrics.length} รายการตามผลกรอง)
            </span>
            <div className="overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
              <div style={{ height: Math.max(350, topFabrics.length * 32) }} className="w-full">
                {topFabrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topFabrics}
                      layout="vertical"
                      margin={{ top: 0, right: 70, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="#F1F5F9"
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: '#F8FAFC' }}
                        formatter={(value: any, name: string, props: any) => {
                          const item = props?.payload;
                          const yardStr = `${formatNumber(value, 2)} หลา`;
                          if (item) {
                            return [`${yardStr} (สุทธิ: ${formatCurrency(item.netTotal)})`, 'ยอดขายสุทธิ'];
                          }
                          return [yardStr, 'ยอดรวม'];
                        }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                      />
                      <Bar
                        dataKey="yards"
                        fill="#4F46E5"
                        radius={[0, 6, 6, 0]}
                        onClick={(data) => triggerFabricColorDrilldown(data.name, data.colors, data.yards, data.netTotal)}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <LabelList
                          dataKey="yards"
                          position="right"
                          formatter={(val: number) => `${formatNumber(val, 1)} หลา`}
                          style={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs py-10">
                    ไม่พบข้อมูลรุ่นผ้ารายการค้นหา
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed tabular listing for accurate unlimited viewing */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">บัญชีรายการผ้าทั้งหมดแบบเรียงลำดับ</span>
              <span className="text-[9px] font-bold text-slate-400 bg-white border px-2 py-1 rounded-md">
                ดับเบิ้ลคลิกแถวเพื่อเข้าข้อมูลย่อย
              </span>
            </div>
            <div className="overflow-y-auto max-h-[460px] divide-y divide-slate-100">
              {topFabrics.length > 0 ? (
                topFabrics.map((f, i) => {
                  const isSheer = SHEER_FABRICS.includes(f.name.toUpperCase());
                  const isWide = WIDE_FABRICS.includes(f.name.toUpperCase());

                  return (
                    <div
                      key={f.name}
                      onDoubleClick={() => triggerFabricColorDrilldown(f.name, f.colors, f.yards, f.netTotal)}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-extrabold text-slate-400 w-5 block text-center">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-[13px] font-bold text-slate-800 block">
                            {f.name}
                          </span>
                          <span className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                              isSheer 
                                ? 'bg-teal-50 text-teal-700 border border-teal-150' 
                                : isWide 
                                  ? 'bg-slate-80 text-slate-700 border border-slate-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                            }`}>
                              {isSheer ? 'ผ้าม่านโปร่งหน้ากว้าง' : isWide ? 'ผ้าม่านทึบหน้ากว้าง' : 'ผ้าผืนปกติ'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {Object.keys(f.colors).length} ชุดสีคัดเลือก
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-indigo-650 block">
                          {formatNumber(f.yards, 2)} <span className="text-[10px] text-slate-400 font-bold">หลา</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          มูลค่า: {formatCurrency(f.netTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ไม่มีรายการผ้าที่กรองพบ
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 👥 Employees & Provinces double clickable visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sales Representatives Deep Breakdown Container */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">ยอดจำหน่ายและผลงานแยกตามพนักงาน (Sales Stats)</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">เรียงลำดับผลสัมฤทธิ์ตามความพร้อมยอดปิดรวมสะสม</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md select-none shrink-0 whitespace-nowrap">
                💡 คลิก/ดับเบิ้ลคลิก เพื่อวิเคราะห์ข้อมูลพนักงานรายบุคคล
              </span>
            </div>

            {/* Employee Bar Chart */}
            <div className="h-[280px] bg-slate-50/50 p-2 border border-slate-100 rounded-2xl mb-4">
              {employeeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeData}
                    layout="vertical"
                    margin={{ top: 15, right: 70, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: '#F8FAFC' }}
                      formatter={(value: any) => [`${formatCurrency(value)}`, 'ยอดขายสุทธิ']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10B981"
                      radius={[0, 6, 6, 0]}
                      onClick={(data) => triggerEmployeeDrilldown(data.name)}
                      className="cursor-pointer hover:opacity-90"
                    >
                      <LabelList
                        dataKey="sales"
                        position="right"
                        formatter={(val: number) => formatCurrency(val)}
                        style={{ fill: '#334155', fontSize: 8.5, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  ยังไม่มีฐานข้อมูลพนักงานดำเนินการ
                </div>
              )}
            </div>

            {/* List interface for perfect row double click engagement */}
            <div className="bg-slate-50 rounded-2xl border border-slate-150 shadow-3xs overflow-hidden max-h-[190px] overflow-y-auto">
              {employeeData.map((emp, i) => (
                <div
                  key={emp.name}
                  onDoubleClick={() => triggerEmployeeDrilldown(emp.name)}
                  className="p-3 flex items-center justify-between border-b border-slate-100 hover:bg-slate-100/60 select-none cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-400 w-5 block text-center bg-white border border-slate-200 rounded-sm">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-700">{emp.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold">
                      {emp.count} โครงงาน
                    </span>
                    <span className="font-extrabold text-slate-800 text-[13px]">
                      {formatCurrency(emp.sales)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Geographic & Province breakups */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">ตลาดและการขยายตัวรายจังหวัด (Province Stats)</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">จัดลำดับความเจริญจังหวัดเป้าหมายตามมูลค่าสุทธิสะสม</p>
                </div>
              </div>
              <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 font-bold px-2 py-1 rounded-md select-none shrink-0 whitespace-nowrap">
                💡 คลิก/ดับเบิ้ลคลิก เพื่อเจาะดูสถิติแยกตามรายจังหวัด
              </span>
            </div>

            {/* Province Bar Chart */}
            <div className="h-[280px] bg-slate-50/50 p-2 border border-slate-100 rounded-2xl mb-4">
              {provinceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={provinceData.slice(0, 10)} // Show top 10 in chart for clarity
                    layout="vertical"
                    margin={{ top: 15, right: 70, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: '#F8FAFC' }}
                      formatter={(value: any) => [`${formatCurrency(value)}`, 'ยอดสะสม']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#F59E0B"
                      radius={[0, 6, 6, 0]}
                      onClick={(data) => triggerProvinceDrilldown(data.name)}
                      className="cursor-pointer hover:opacity-90"
                    >
                      <LabelList
                        dataKey="sales"
                        position="right"
                        formatter={(val: number) => formatCurrency(val)}
                        style={{ fill: '#334155', fontSize: 8.5, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  ยังไม่มีฐานข้อมูลตำแหน่งต่างจังหวัด
                </div>
              )}
            </div>

            {/* List interface for precise double-clicking row */}
            <div className="bg-slate-50 rounded-2xl border border-slate-150 shadow-3xs overflow-hidden max-h-[190px] overflow-y-auto">
              {provinceData.map((prov, i) => (
                <div
                  key={prov.name}
                  onDoubleClick={() => triggerProvinceDrilldown(prov.name)}
                  className="p-3 flex items-center justify-between border-b border-slate-100 hover:bg-slate-100/60 select-none cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-400 w-5 block text-center bg-white border border-slate-200 rounded-sm">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-700">จังหวัด {prov.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold">
                      {prov.count} งานสั่งตัด
                    </span>
                    <span className="font-extrabold text-slate-800 text-[13px]">
                      {formatCurrency(prov.sales)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* 🚀 DEEP INTERACTIVE DRILL-DOWN MODAL PANELS */}
      <AnimatePresence>
        {drilldown && (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-150"
            >
              
              {/* Header section in modal */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white">
                    <ActivityIconForModal type={drilldown.type} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm tracking-wide md:text-base">
                      {drilldown.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                      ความปลอดภัย/บัญชีข้อมูลวิจัยโครงการสุทธิ (Drill-Down Data Analytics)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrilldown(null)}
                  className="p-2.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 bg-white shadow-2xs border border-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Data list in modal scroll area */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* A. PROJECTS list breakdown (onDoubleClick 'โครงการทั้งหมด') */}
                {drilldown.type === 'projects' && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">เลขที่ใบเสนอราคา</th>
                          <th className="px-4 py-3">ชื่อลูกค้า</th>
                          <th className="px-4 py-3">จังหวัด</th>
                          <th className="px-4 py-3 text-center">วันที่ตกลง</th>
                          <th className="px-4 py-3">พนักงานดูแล</th>
                          <th className="px-4 py-3 text-right">ยอดรวมสุทธิ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {drilldown.data.map((p: Project) => (
                          <tr key={p.id} className="hover:bg-slate-50/55 transition-colors">
                            <td className="px-4 py-3 font-bold text-indigo-650">{p.quotation_no}</td>
                            <td className="px-4 py-3 text-slate-800">{p.customerName || 'ลูกค้าใหม่'}</td>
                            <td className="px-4 py-3 text-slate-505">{p.province || 'ไม่ระบุ'}</td>
                            <td className="px-4 py-3 text-center text-slate-400 font-bold">{p.confirm_date}</td>
                            <td className="px-4 py-3 text-slate-650 font-semibold">{p.sale_id}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(p.netTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* B. FABRICS breakdown (onDoubleClick 'ค่าวัสดุผ้า (F)') */}
                {drilldown.type === 'fabric_contrib' && (
                  <div className="space-y-3">
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/60 leading-normal">
                      <span className="text-xs text-indigo-900 font-bold block mb-1">💡 โน้ตวิเคราะห์อุปสงค์ผ้าสะสม</span>
                      <p className="text-[11px] text-indigo-700">
                        รายการด้านล่างรวมรุ่นผ้าทั้งหมดที่ถูกกำหนดใช้ในใบเสนอราคาตามขอบเขตช่วงตัวเลือกปัจจุบัน เรียงตามความยาวหลารวม
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px]">
                          <tr>
                            <th className="px-4 py-3">รุ่นผ้า / รุ่นโมดูล</th>
                            <th className="px-4 py-3">ประเภท</th>
                            <th className="px-4 py-3 text-center">สีย่อยสะสม</th>
                            <th className="px-4 py-3 text-right">จำนวนหลาจัดส่งรวม</th>
                            <th className="px-4 py-3 text-right">มูลค่ายอดสะสมสุทธิ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {drilldown.data.map((f: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/55">
                              <td className="px-4 py-3 font-bold text-slate-800">{f.name}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                                  f.category.includes('โปร่ง') 
                                    ? 'bg-teal-50 text-teal-700 border border-teal-150' 
                                    : f.category.includes('ทึบ') 
                                      ? 'bg-slate-50 text-slate-700 border border-slate-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                                }`}>
                                  {f.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-405 font-bold">{f.colorsCount} สี</td>
                              <td className="px-4 py-3 text-right font-black text-indigo-650">{formatNumber(f.yards, 2)} หลา</td>
                              <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(f.netTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* C. SEWING breakdown (onDoubleClick 'ค่าตัดเย็บ & บริการ (P)') */}
                {drilldown.type === 'sewing_contrib' && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px]">
                        <tr>
                          <th className="px-4 py-3">ใบงานอ้างอิง / ลูกค้า</th>
                          <th className="px-4 py-3">รายการคำสั่งที่ป้อนในระบบ</th>
                          <th className="px-4 py-3">ตำแหน่งห้อง</th>
                          <th className="px-4 py-3 text-right">จำนวนหน่วยบริการ</th>
                          <th className="px-4 py-3 text-right">มูลค่ารวมหลังหักส่วนลด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {drilldown.data.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/55">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{item.quotationNo}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{item.customer}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600 text-[12px]">{item.desc}</td>
                            <td className="px-4 py-3 text-slate-405 font-bold">{item.room}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{formatNumber(item.qty)} {item.unit}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* D. ACCESSORY breakdown (onDoubleClick 'ค่าราง & อุปกรณ์ (A)') */}
                {drilldown.type === 'accessory_contrib' && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px]">
                        <tr>
                          <th className="px-4 py-3">ใบงานอ้างอิง / ลูกค้า</th>
                          <th className="px-4 py-3">อุปกรณ์ประกอบ และรางม่านมู่ลี่</th>
                          <th className="px-4 py-3">คำพิกัดห้อง</th>
                          <th className="px-4 py-3 text-right">จำนวนจัดใช้</th>
                          <th className="px-4 py-3 text-right">มูลค่ารวมหลังส่วนลด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {drilldown.data.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/55">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{item.quotationNo}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{item.customer}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-650">{item.desc}</td>
                            <td className="px-4 py-3 text-slate-405 font-bold">{item.room}</td>
                            <td className="px-4 py-3 text-right font-bold text-amber-600">{formatNumber(item.qty)} {item.unit}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* E. COLORS detailed breakdown on fabric row double-clicked */}
                {drilldown.type === 'colors' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50">
                      <div>
                        <span className="text-[10px] text-indigo-700 font-black uppercase tracking-wider block">สถิติจำหน่ายรุ่นผ้า</span>
                        <h4 className="text-sm font-black text-slate-800 mt-0.5">รวมจำหน่ายทั้งสิ้น: {formatNumber(drilldown.data.total, 2)} หลา</h4>
                      </div>
                      <span className="text-sm font-black text-emerald-600">
                        มูลค่ายอดรวมสะสม: {formatCurrency(drilldown.data.totalNetTotal)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {drilldown.data.colors.map((c: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-xl border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{c.colorName}</span>
                            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                              ยอดเงินหลังหักส่วนลดสะสม: {formatCurrency(c.netTotal)}
                            </span>
                          </div>
                          <span className="font-extrabold text-indigo-650 text-[13px] whitespace-nowrap shrink-0">
                            {formatNumber(c.yards, 2)}{' '}
                            <span className="text-[10px] font-bold text-slate-400 ml-1">หลา</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* F. EMPLOYEE Deep analysis (onDoubleClick Employee) */}
                {drilldown.type === 'employee_detail' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-center">
                        <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">ชื่อพนักงานขาย</span>
                        <p className="text-base font-extrabold text-slate-800 mt-1">{drilldown.data.employeeName}</p>
                      </div>
                      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 text-center animate-fade-in">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">ยอดจำหน่ายรวมที่ทำสำเร็จ</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{formatCurrency(drilldown.data.salesSum)}</p>
                      </div>
                      <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-150 text-center">
                        <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase block">ความจุงานปิดสำเร็จ</span>
                        <p className="text-base font-black text-indigo-750 mt-1">{drilldown.data.projCount} โครงการ</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Fabrics lists sold */}
                      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-505 uppercase tracking-wider">บัญชีผ้าและจำนวนความยาวที่จำหน่าย</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                          {drilldown.data.fabrics.length > 0 ? (
                            drilldown.data.fabrics.map((f: any, idx: number) => {
                              const isSheer = SHEER_FABRICS.includes(f.name.toUpperCase());
                              const isWide = WIDE_FABRICS.includes(f.name.toUpperCase());

                              return (
                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 text-xs">
                                  <div>
                                    <span className="font-bold text-slate-800 block text-[13px]">{f.name}</span>
                                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-sm inline-block mt-0.5 ${
                                      isSheer ? 'bg-teal-50 text-teal-700 border' : isWide ? 'bg-slate-100 text-slate-700 border' : 'bg-indigo-50 text-indigo-700 border'
                                    }`}>
                                      {isSheer ? 'ม่านโปร่งหน้ากว้าง' : isWide ? 'ม่านทึบหน้ากว้าง' : 'ผ้าปกติ'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-indigo-650 block">{formatNumber(f.yards, 2)} หลา</span>
                                    <span className="text-[10px] font-bold text-emerald-600 block">{formatCurrency(f.netTotal)}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                              ไม่พบข้อมูลการขายผ้าของพนักงานรายนี้
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Projects Closed list */}
                      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-505 uppercase tracking-wider">โครงการปิดงาน (Projects List)</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                          {drilldown.data.projects.map((p: Project) => (
                            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs border-b border-slate-100">
                              <div>
                                <span className="font-bold text-indigo-650 block">{p.quotation_no}</span>
                                <span className="text-[10.5px] text-slate-700 font-semibold">{p.customerName || 'ลูกค้าใหม่'}</span>
                                <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">พิกัดจัดลง: {p.province}</span>
                              </div>
                              <span className="font-black text-emerald-650 whitespace-nowrap shrink-0">
                                {formatCurrency(p.netTotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* G. PROVINCE Deep analysis (onDoubleClick Province) */}
                {drilldown.type === 'province_detail' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-center">
                        <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">พิกัดทางภูมิภาคจังหวัด</span>
                        <p className="text-base font-extrabold text-slate-850 mt-1">{drilldown.data.provinceName}</p>
                      </div>
                      <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 text-center">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">มูลค่าโครงการสะสมสะกดสุทธิ</span>
                        <p className="text-base font-black text-emerald-700 mt-1">{formatCurrency(drilldown.data.salesSum)}</p>
                      </div>
                      <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-150 text-center">
                        <span className="text-[10px] font-black text-indigo-700 tracking-wider uppercase block">จำนวนงานสั่งผลิตลงที่นี่</span>
                        <p className="text-base font-black text-indigo-750 mt-1">{drilldown.data.projCount} งานผลิต</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Fabrics lists sold in province */}
                      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-505 uppercase tracking-wider">อุปสงค์ชนิดผ้าในภูมิภาคนิยม</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                          {drilldown.data.fabrics.length > 0 ? (
                            drilldown.data.fabrics.map((f: any, idx: number) => {
                              const isSheer = SHEER_FABRICS.includes(f.name.toUpperCase());
                              const isWide = WIDE_FABRICS.includes(f.name.toUpperCase());

                              return (
                                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 text-xs">
                                  <div>
                                    <span className="font-bold text-slate-800 block text-[13px]">{f.name}</span>
                                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-sm inline-block mt-0.5 ${
                                      isSheer ? 'bg-teal-50 text-teal-700 border' : isWide ? 'bg-slate-100 text-slate-700 border' : 'bg-indigo-50 text-indigo-700 border'
                                    }`}>
                                      {isSheer ? 'ม่านโปร่งหน้ากว้าง' : isWide ? 'ม่านทึบหน้ากว้าง' : 'ผ้าปกติ'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-indigo-650 block">{formatNumber(f.yards, 2)} หลา</span>
                                    <span className="text-[10px] font-bold text-emerald-600 block">{formatCurrency(f.netTotal)}</span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs text-slate-405">
                              ไม่มีการใช้วัตถุดิบผ้าประกอบของจังหวัดนี้
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Projects located in province */}
                      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-505 uppercase tracking-wider">ใบสั่งซื้อสังคายนา (Projects in Province)</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                          {drilldown.data.projects.map((p: Project) => (
                            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs border-b border-slate-100">
                              <div>
                                <span className="font-bold text-indigo-650 block">{p.quotation_no}</span>
                                <span className="text-[10.5px] text-slate-700 font-semibold">{p.customerName || 'ลูกค้าใหม่'}</span>
                                <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">คนดูแล: {p.sale_id}</span>
                              </div>
                              <span className="font-black text-emerald-650 whitespace-nowrap shrink-0">
                                {formatCurrency(p.netTotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Modal footer */}
              <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  onClick={() => setDrilldown(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ปิดแผงตรวจเจาะลึก
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Small Modal icon classifier
function ActivityIconForModal({ type }: { type: string }) {
  switch (type) {
    case 'projects':
      return <LayoutGrid className="w-4 h-4 text-white" />;
    case 'fabric_contrib':
    case 'colors':
      return <PieChartIcon className="w-4 h-4 text-white" />;
    case 'sewing_contrib':
      return <Scissors className="w-4 h-4 text-white" />;
    case 'accessory_contrib':
      return <PenTool className="w-4 h-4 text-white" />;
    case 'employee_detail':
      return <UserCheck className="w-4 h-4 text-white" />;
    case 'province_detail':
      return <MapPin className="w-4 h-4 text-white" />;
    default:
      return <ActivityIconForModal type="projects" />;
  }
}
