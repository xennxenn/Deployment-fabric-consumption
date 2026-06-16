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
  Coins,
  ArrowUpDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LabelList,
  Cell
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

  // Search Filter for monthly average fabrics list
  const [avgFabricSearch, setAvgFabricSearch] = useState('');

  // Sorting selectors for Drilldowns
  const [drilldownSortField, setDrilldownSortField] = useState<'yards' | 'sales'>('yards');
  const [drilldownSortOrder, setDrilldownSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estimator State
  const [targetRevenue, setTargetRevenue] = useState<number>(100000);

  // Drilldown Modal State
  const [drilldown, setDrilldown] = useState<{
    type: 'projects' | 'fabric_contrib' | 'sewing_contrib' | 'accessory_contrib' | 'employee_detail' | 'province_detail' | 'colors';
    title: string;
    data: any;
  } | null>(null);

  const [activeAccTab, setActiveAccTab] = useState<'all' | 'roller' | 'venetian'>('all');

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
    let totalSolidCurtains = 0;
    let totalSheerCurtains = 0;

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
        } else if (item.item_type === 'P') {
          const isCurtain = !(item.descriptions.includes('ติดตั้ง') || item.descriptions.includes('ขนส่ง') || 
                            item.descriptions.includes('เดินทาง') || item.descriptions.includes('รื้อถอน') || 
                            item.descriptions.includes('ซ่อม') || item.descriptions.includes('ราง'));
          if (isCurtain) {
            const isSheer = item.descriptions.includes('โปร่ง') || item.descriptions.toUpperCase().includes('SHEER');
            if (isSheer) {
              totalSheerCurtains += item.qty;
            } else {
              totalSolidCurtains += item.qty;
            }
          }
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
      totalSolidCurtains,
      totalSheerCurtains,
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
    totalSolidCurtains,
    totalSheerCurtains,
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

  // Compute total months in the selected search range for monthly averages calculation
  const totalMonthsFiltered = React.useMemo(() => {
    return Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
  }, [startYear, startMonth, endYear, endMonth]);

  // Display top 10 best sellers by default, or all filtered list if search term is active
  const topFabricsForAvg = React.useMemo(() => {
    if (avgFabricSearch) {
      return topFabricsOriginal.filter(f => f.name.toLowerCase().includes(avgFabricSearch.toLowerCase()));
    } else {
      return topFabricsOriginal.slice(0, 10);
    }
  }, [topFabricsOriginal, avgFabricSearch]);

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

    setActiveAccTab('all');
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

  const solidCurtainRatio = totalNetSales > 0 ? (totalSolidCurtains / totalNetSales) : (60 / 100000);
  const sheerCurtainRatio = totalNetSales > 0 ? (totalSheerCurtains / totalNetSales) : (45 / 100000);

  const estimatedNormal = targetRevenue * normRatio;
  const estimatedWideBlackout = targetRevenue * wideBlackRatio;
  const estimatedWideSheer = targetRevenue * wideShRatio;
  const estimatedTotal = estimatedNormal + estimatedWideBlackout + estimatedWideSheer;

  const estimatedSolidCurtains = targetRevenue * solidCurtainRatio;
  const estimatedSheerCurtains = targetRevenue * sheerCurtainRatio;
  const estimatedTotalCurtains = estimatedSolidCurtains + estimatedSheerCurtains;

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
                เครื่องมือประเมินความต้องการใช้วัตถุดิบผ้าอัตโนมัติ (Dynamic Fabric Estimation & Pieces)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed text-justify">
              ระบบวิเคราะห์ข้อมูลจากสถิติโครงการสั่งตัดจริงในช่วงเวลาที่คุณเลือกปัจจุบัน อัตรารายรับสุทธิ 
              <span className="font-extrabold text-emerald-400 ml-1">100,000 บาท</span> จะใช้วัตถุดิบผ้าปกติเฉลี่ย 
              <span className="font-bold text-indigo-300 mx-1">{formatNumber(normRatio * 100000, 1)} หลา</span>, 
              ทึบหน้ากว้าง <span className="font-bold text-indigo-300 mx-1">{formatNumber(wideBlackRatio * 100000, 1)} หลา</span> 
              (ถัวเฉลี่ย <span className="font-bold text-blue-300">{formatNumber(solidCurtainRatio * 100000, 1)} ผืน</span>) 
              และโปร่งหน้ากว้าง <span className="font-bold text-indigo-300 mx-1">{formatNumber(wideShRatio * 100000, 1)} หลา</span>
              (ถัวเฉลี่ย <span className="font-bold text-teal-300">{formatNumber(sheerCurtainRatio * 100000, 1)} ผืน</span>)
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
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/40 text-[10.5px] font-black text-blue-200">
                  🎯 ประเมิน {formatNumber(Math.max(0, estimatedSolidCurtains), 0)} ผืน
                </div>
              </div>
            </div>

            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[10px] font-black text-teal-300 uppercase block tracking-wider mb-2">ม่านโปร่งหน้ากว้าง</span>
              <div>
                <p className="text-xl font-black text-white">{formatNumber(estimatedWideSheer, 1)}</p>
                <span className="text-[10px] font-bold text-slate-400">หลา</span>
                <div className="mt-1.5 pt-1.5 border-t border-slate-700/40 text-[10.5px] font-black text-teal-200">
                  🎯 ประเมิน {formatNumber(Math.max(0, estimatedSheerCurtains), 0)} ผืน
                </div>
              </div>
            </div>

            <div className="bg-indigo-900/60 p-4 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-black text-emerald-300 uppercase block tracking-wider mb-2">ความต้องการใช้อุปสงค์รวม</span>
              <div>
                <p className="text-xl font-black text-emerald-400">{formatNumber(estimatedTotal, 1)}</p>
                <span className="text-[10px] font-extrabold text-slate-300">หลารวมทั้งหมด</span>
                <div className="mt-1.5 pt-1.5 border-t border-indigo-400/40 text-[10.5px] font-black text-emerald-200">
                  📦 รวม {formatNumber(Math.max(0, estimatedTotalCurtains), 0)} ผืน
                </div>
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

      {/* 📅 Section 4: Average Monthly Fabric Consumption */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 mt-6" id="monthly-average-fabrics-panel">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 font-sans">
              <Calendar className="w-5 h-5 text-indigo-600 animate-pulse" /> อัตราการใช้ผ้าเฉลี่ยต่อเดือน (Monthly Average Fabric Consumption)
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5 font-sans">
              คำนวณสถิติความเร็วการระบายผ้าเป็นจำนวนหลาต่อเดือน (คำนวณจากยอดโครงการสะสมทั้งหมด <span className="text-indigo-600 font-black">{totalMonthsFiltered}</span> เดือนของช่วงตัวเลือกปัจจุบัน)
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="ค้นหารุ่นคลังผ้าอื่น..."
              value={avgFabricSearch}
              onChange={(e) => setAvgFabricSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-650 transition-all font-bold placeholder-slate-455 text-slate-700"
            />
            {avgFabricSearch && (
              <button
                onClick={() => setAvgFabricSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50/40 border border-slate-200/65 rounded-2xl p-4 mb-6 leading-normal flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-550 font-medium font-sans">
            มาตรฐานแสดงข้อมูล <span className="font-extrabold text-indigo-650">ผ้า 10 รายการขายดีที่สุด (Top 10 Best Sellers)</span> เป็นค่าเริ่มต้นอัตโนมัติตามข้อกำหนดของทีมพัฒนา หากต้องการดูรายงานสถิติตัวอื่นๆ สามารถป้อนโค้ดหรือชื่อของผ้ารุ่นใดๆ ในช่องค้นหาด้านบนเพื่อวิเคราะห์ค่าเฉลี่ยรายเดือนได้ทันทีแบบเรียลไทม์
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topFabricsForAvg.length > 0 ? (
            topFabricsForAvg.map((f: any, idx: number) => {
              const uName = f.name.toUpperCase();
              const isSheer = SHEER_FABRICS.includes(uName);
              const isWide = WIDE_FABRICS.includes(uName);
              const avgPerMonth = f.yards / totalMonthsFiltered;

              const categoryLabel = isSheer
                ? 'ผ้าม่านโปร่งหน้ากว้าง'
                : isWide
                  ? 'ผ้าม่านทึบหน้ากว้าง'
                  : 'ผ้าผืนปกติ';

              return (
                <div 
                  key={idx}
                  className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-2xs transition-all hover:border-slate-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[13px] font-extrabold text-slate-800 block leading-tight font-sans">
                        {f.name}
                      </span>
                      <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-sm mt-1.5 uppercase leading-none border select-none tracking-wide ${
                        isSheer 
                          ? 'bg-teal-50 text-teal-700 border-teal-150' 
                          : isWide 
                            ? 'bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                      }`}>
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block leading-none font-sans">ความกว้างรวม</span>
                      <span className="text-[13px] font-black text-slate-800 block mt-1 leading-none font-mono">
                        {formatNumber(f.yards, 2)} หลา
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100/70 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-450 font-extrabold block uppercase tracking-wide font-sans">
                        อัตราเฉลี่ยความต้องการใช้ผ้าจริงรายเดือน (Monthly Volumetric Speed)
                      </span>
                      <span className="text-base font-black text-indigo-650 flex items-baseline gap-1 mt-1 leading-none font-mono">
                        {formatNumber(avgPerMonth, 2)} 
                        <span className="text-[10px] text-slate-450 font-bold font-sans">หลา/เดือน</span>
                      </span>
                    </div>

                    <div className="px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center min-w-24">
                      <span className="text-[8px] font-black text-indigo-550 block leading-none uppercase select-none font-sans">
                        มูลค่าเฉลี่ย
                      </span>
                      <span className="text-[11px] font-black text-indigo-700 mt-1.5 leading-none font-mono">
                        {formatCurrency(f.netTotal / totalMonthsFiltered)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-450 text-xs font-semibold">
              ไม่พบข้อมูลผ้ารุ่นดังกล่าวในการประมวลผลช่วงเวลานี้
            </div>
          )}
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
                
                {/* SORTING BAR FOR DRILLDOWNS WITH FABRIC SELECTIONS */}
                {(drilldown.type === 'fabric_contrib' || drilldown.type === 'employee_detail' || drilldown.type === 'province_detail') && (
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
                    <span className="font-extrabold text-slate-500">เรียงลำดับมิติข้อมูลรายนี้ (Sort Drilldown):</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDrilldownSortField('yards')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            drilldownSortField === 'yards'
                              ? 'bg-slate-800 text-white shadow-3xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          จำนวนหลา (Yards)
                        </button>
                        <button
                          onClick={() => setDrilldownSortField('sales')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            drilldownSortField === 'sales'
                              ? 'bg-slate-800 text-white shadow-3xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ยอดขายสุทธิ (Sales)
                        </button>
                      </div>
                      <div className="h-4 border-l border-slate-200"></div>
                      <button
                        onClick={() => setDrilldownSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{drilldownSortOrder === 'desc' ? 'เรียงจากมากไปน้อย' : 'เรียงจากน้อยไปมาก'}</span>
                      </button>
                    </div>
                  </div>
                )}

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
                        รายการด้านล่างรวมรุ่นผ้าทั้งหมดที่ถูกกำหนดใช้ในใบเสนอราคาตามขอบเขตช่วงตัวเลือกปัจจุบัน เรียงลำดับตามตัวเลือกที่คุณกำหนดด้านบน
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
                          {[...drilldown.data].sort((a: any, b: any) => {
                            const valA = drilldownSortField === 'yards' ? a.yards : a.netTotal;
                            const valB = drilldownSortField === 'yards' ? b.yards : b.netTotal;
                            return drilldownSortOrder === 'desc' ? valB - valA : valA - valB;
                          }).map((f: any, idx: number) => (
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
                {drilldown.type === 'sewing_contrib' && (() => {
                  const curtainItems = drilldown.data.filter((item: any) => {
                    return isCurtainSewing(item.desc);
                  });

                  const aggregatedMap: { [key: string]: { name: string; qty: number; type: 'ทึบ' | 'โปร่ง'; sewingStyle: string } } = {};
                  let totalCurtainsCount = 0;
                  let totalSolidCount = 0;
                  let totalSheerCount = 0;

                  curtainItems.forEach((item: any) => {
                    const desc = item.desc || '';
                    const isSheer = isSheerCurtain(desc);
                    const category = isSheer ? 'ผ้าม่านโปร่ง' : 'ผ้าม่านทึบ';
                    const style = classifySewingStyle(desc);
                    const key = `${category} - ${style}`;

                    totalCurtainsCount += item.qty;
                    if (isSheer) {
                      totalSheerCount += item.qty;
                    } else {
                      totalSolidCount += item.qty;
                    }

                    if (!aggregatedMap[key]) {
                      aggregatedMap[key] = {
                        name: key,
                        qty: 0,
                        type: isSheer ? 'โปร่ง' : 'ทึบ',
                        sewingStyle: style
                      };
                    }
                    aggregatedMap[key].qty += item.qty;
                  });

                  const chartDataList = Object.values(aggregatedMap).sort((a, b) => b.qty - a.qty);

                  return (
                    <div className="space-y-6">
                      {/* KPI cards in the sewing drilldown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-slate-800 shadow-sm">
                          <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">
                            จำนวนรวมผ้าม่านทั้งหมด
                          </span>
                          <p className="text-2xl font-black text-white">
                            {formatNumber(totalCurtainsCount, 0)} <span className="text-xs font-bold text-slate-300">ผืน</span>
                          </p>
                          <p className="text-[10px] text-indigo-300 font-bold mt-1">คัดเฉพาะใบเสนอราคาตัดผ้าจริงในระบบ</p>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 md:p-5 shadow-3xs">
                          <span className="text-[10px] font-black tracking-wider uppercase text-indigo-700 block mb-1">
                            ผ้าม่านทึบสะสม
                          </span>
                          <p className="text-2xl font-black text-indigo-900">
                            {formatNumber(totalSolidCount, 0)} <span className="text-xs font-bold text-indigo-550">ผืน</span>
                          </p>
                          <p className="text-[10px] text-indigo-500 font-bold mt-1">
                            คิดเป็น {totalCurtainsCount > 0 ? formatNumber((totalSolidCount / totalCurtainsCount) * 100, 1) : 0}% ของทั้งหมด
                          </p>
                        </div>

                        <div className="bg-teal-50 border border-teal-150 rounded-2xl p-4 md:p-5 shadow-3xs">
                          <span className="text-[10px] font-black tracking-wider uppercase text-teal-700 block mb-1">
                            ผ้าม่านโปร่งสะสม
                          </span>
                          <p className="text-2xl font-black text-teal-900">
                            {formatNumber(totalSheerCount, 0)} <span className="text-xs font-bold text-teal-550">ผืน</span>
                          </p>
                          <p className="text-[10px] text-teal-500 font-bold mt-1">
                            คิดเป็น {totalCurtainsCount > 0 ? formatNumber((totalSheerCount / totalCurtainsCount) * 100, 1) : 0}% ของทั้งหมด
                          </p>
                        </div>
                      </div>

                      {/* Separated Charts Grid */}
                      {chartDataList.length > 0 ? (() => {
                        const solidData = chartDataList.filter(item => item.type === 'ทึบ').sort((a, b) => b.qty - a.qty);
                        const sheerData = chartDataList.filter(item => item.type === 'โปร่ง').sort((a, b) => b.qty - a.qty);

                        const solidHeight = Math.max(140, solidData.length * 40 + 60);
                        const sheerHeight = Math.max(140, sheerData.length * 40 + 60);

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Solid Curtains Chart */}
                            <div className="bg-indigo-50/30 border border-indigo-100 p-5 rounded-2xl flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 inline-block"></span>
                                  ผ้าม่านทึบ (Solid Curtains)
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold mb-4">จัดอันดับรูปแบบการตัดเย็บของม่านทึบสะสม</p>
                              </div>
                              
                              {solidData.length > 0 ? (
                                <div className="w-full" style={{ minHeight: `${solidHeight}px` }}>
                                  <ResponsiveContainer width="100%" height={solidHeight}>
                                    <BarChart
                                      data={solidData}
                                      layout="vertical"
                                      margin={{ top: 10, right: 60, left: 10, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#E2E8F0" />
                                      <XAxis type="number" hide />
                                      <YAxis
                                        dataKey="sewingStyle"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 10.5, fill: '#3730a3', fontWeight: 900 }}
                                        axisLine={false}
                                        tickLine={false}
                                      />
                                      <RechartsTooltip
                                        formatter={(value: any) => [`${formatNumber(value, 0)} ผืน`, 'ปริมาณผลิต']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }}
                                      />
                                      <Bar dataKey="qty" radius={[0, 4, 4, 0]} barSize={16}>
                                        {solidData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill="#312e81" />
                                        ))}
                                        <LabelList
                                          dataKey="qty"
                                          position="right"
                                          formatter={(v: any) => `${formatNumber(v, 0)} ผืน`}
                                          style={{ fill: '#312e81', fontSize: 10.5, fontWeight: 900, fontFamily: 'monospace' }}
                                        />
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 py-6 text-center font-bold">ไม่มีข้อมูลการผลิตม่านทึบกระบวนการนี้</p>
                              )}
                            </div>

                            {/* Sheer Curtains Chart */}
                            <div className="bg-teal-50/30 border border-teal-100 p-5 rounded-2xl flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
                                  ผ้าม่านโปร่ง (Sheer Curtains)
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold mb-4">จัดอันดับรูปแบบการตัดเย็บของม่านโปร่งสะสม</p>
                              </div>

                              {sheerData.length > 0 ? (
                                <div className="w-full" style={{ minHeight: `${sheerHeight}px` }}>
                                  <ResponsiveContainer width="100%" height={sheerHeight}>
                                    <BarChart
                                      data={sheerData}
                                      layout="vertical"
                                      margin={{ top: 10, right: 60, left: 10, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#E2E8F0" />
                                      <XAxis type="number" hide />
                                      <YAxis
                                        dataKey="sewingStyle"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 10.5, fill: '#0d9488', fontWeight: 900 }}
                                        axisLine={false}
                                        tickLine={false}
                                      />
                                      <RechartsTooltip
                                        formatter={(value: any) => [`${formatNumber(value, 0)} ผืน`, 'ปริมาณผลิต']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 'bold' }}
                                      />
                                      <Bar dataKey="qty" radius={[0, 4, 4, 0]} barSize={16}>
                                        {sheerData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill="#0d9488" />
                                        ))}
                                        <LabelList
                                          dataKey="qty"
                                          position="right"
                                          formatter={(v: any) => `${formatNumber(v, 0)} ผืน`}
                                          style={{ fill: '#0d9488', fontSize: 10.5, fontWeight: 900, fontFamily: 'monospace' }}
                                        />
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 py-6 text-center font-bold">ไม่มีข้อมูลการผลิตม่านโปร่งกระบวนการนี้</p>
                              )}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400 font-bold">
                          ไม่มีข้อมูลปริมาณผ้าม่านในช่วงเวลาที่เลือกบัดนี้
                        </div>
                      )}

                      {/* Raw Details Table */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                          📋 รายละเอียดบันทึกรายห้อง และราคาบริการตัดเย็บ (Database Service Logging)
                        </h4>
                        <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[300px] overflow-y-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px] sticky top-0">
                              <tr>
                                <th className="px-4 py-3 bg-slate-50">ใบงานอ้างอิง / ลูกค้า</th>
                                <th className="px-4 py-3 bg-slate-50">รายการในใบเสนอราคา</th>
                                <th className="px-4 py-3 bg-slate-50">สัดส่วนประเภท</th>
                                <th className="px-4 py-3 bg-slate-50">ตำแหน่งห้อง</th>
                                <th className="px-4 py-3 text-right bg-slate-50">จำนวนหน่วยบริการ</th>
                                <th className="px-4 py-3 text-right bg-slate-50">มูลค่าหลังหักส่วนลด</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {drilldown.data.map((item: any, idx: number) => {
                                const isSheer = isSheerCurtain(item.desc);
                                const isMyCurtain = isCurtainSewing(item.desc);
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/55">
                                    <td className="px-4 py-3">
                                      <span className="font-bold text-slate-800 block">{item.quotationNo}</span>
                                      <span className="text-[10px] text-slate-400 font-bold">{item.customer}</span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-slate-600 text-[11.5px]">{item.desc}</td>
                                    <td className="px-4 py-3">
                                      {!isMyCurtain ? (
                                        <span className="text-[9.5px] font-bold px-2 py-0.5 bg-slate-100 text-slate-450 rounded border border-slate-200">
                                          บริการอื่นๆ / ม่านสำเร็จ
                                        </span>
                                      ) : isSheer ? (
                                        <span className="text-[9.5px] font-black px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-100">
                                          ผ้าม่านโปร่ง
                                        </span>
                                      ) : (
                                        <span className="text-[9.5px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                          ผ้าม่านทึบ
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-405 font-bold">{item.room}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatNumber(item.qty)} {item.unit}</td>
                                    <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* D. ACCESSORY breakdown (onDoubleClick 'ค่าราง & อุปกรณ์ (A)') */}
                {drilldown.type === 'accessory_contrib' && (() => {
                  const allAccItems = drilldown.data || [];
                  const rollerBlinds = allAccItems.filter((item: any) => isRollerBlind(item.desc));
                  const venetianBlinds = allAccItems.filter((item: any) => isVenetianBlind(item.desc));
                  const railsAndAccessories = allAccItems.filter((item: any) => !isRollerBlind(item.desc) && !isVenetianBlind(item.desc));

                  // Calculate stats
                  const totalRollersValue = rollerBlinds.reduce((sum: number, x: any) => sum + x.total, 0);
                  const totalRollersQty = rollerBlinds.reduce((sum: number, x: any) => sum + x.qty, 0);
                  const totalVenetiansValue = venetianBlinds.reduce((sum: number, x: any) => sum + x.total, 0);
                  const totalVenetiansQty = venetianBlinds.reduce((sum: number, x: any) => sum + x.qty, 0);
                  const totalGeneralValue = railsAndAccessories.reduce((sum: number, x: any) => sum + x.total, 0);
                  const totalGeneralQty = railsAndAccessories.reduce((sum: number, x: any) => sum + x.qty, 0);

                  // Group/Aggregate generic tracks and accessories
                  const trackAgg: { [key: string]: { desc: string; qty: number; unit: string; total: number; bookings: number } } = {};
                  railsAndAccessories.forEach((item: any) => {
                    const cleanName = item.desc.trim();
                    if (!trackAgg[cleanName]) {
                      trackAgg[cleanName] = { desc: cleanName, qty: 0, unit: item.unit || 'เมตร', total: 0, bookings: 0 };
                    }
                    trackAgg[cleanName].qty += item.qty;
                    trackAgg[cleanName].total += item.total;
                    trackAgg[cleanName].bookings += 1;
                  });

                  const sortedTracks = Object.values(trackAgg).sort((a, b) => b.total - a.total);

                  // Group/Aggregate Roller Blinds
                  const rollerAgg: { [key: string]: { desc: string; qty: number; unit: string; total: number; bookings: number } } = {};
                  rollerBlinds.forEach((item: any) => {
                    const cleanName = item.desc.trim();
                    if (!rollerAgg[cleanName]) {
                      rollerAgg[cleanName] = { desc: cleanName, qty: 0, unit: item.unit || 'ชุด', total: 0, bookings: 0 };
                    }
                    rollerAgg[cleanName].qty += item.qty;
                    rollerAgg[cleanName].total += item.total;
                    rollerAgg[cleanName].bookings += 1;
                  });
                  const sortedRollers = Object.values(rollerAgg).sort((a, b) => b.qty - a.qty);

                  // Group/Aggregate Venetian Blinds
                  const venetianAgg: { [key: string]: { desc: string; qty: number; unit: string; total: number; bookings: number } } = {};
                  venetianBlinds.forEach((item: any) => {
                    const cleanName = item.desc.trim();
                    if (!venetianAgg[cleanName]) {
                      venetianAgg[cleanName] = { desc: cleanName, qty: 0, unit: item.unit || 'ชุด', total: 0, bookings: 0 };
                    }
                    venetianAgg[cleanName].qty += item.qty;
                    venetianAgg[cleanName].total += item.total;
                    venetianAgg[cleanName].bookings += 1;
                  });
                  const sortedVenetians = Object.values(venetianAgg).sort((a, b) => b.qty - a.qty);

                  return (
                    <div className="space-y-6">
                      {/* Interactive Selection Guide */}
                      <p className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-2">
                        <span>💡 คำแนะนำ:</span>
                        <span>ท่านสามารถกดเลือกกดที่บัตรสรุปด้านล่าง (รางทั่วไป / ม่านม้วน / มู่ลี่) เพื่อเลือกสลับการดูสินค้าสรุปสะสมเรียงตามจำนวนที่จำหน่ายจากมากไปน้อยแบบเจาะลึกได้ในทันที!</span>
                      </p>

                      {/* Summary KPI Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Tab 1: Rails & Accessories */}
                        <div
                          onClick={() => setActiveAccTab('all')}
                          className={`rounded-2xl p-4 shadow-3xs cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
                            activeAccTab === 'all'
                              ? 'bg-slate-900 border border-slate-800 ring-2 ring-indigo-500 ring-offset-2 scale-[1.02] text-white'
                              : 'bg-slate-950/80 border border-slate-900 opacity-60 saturate-50 hover:opacity-90 hover:scale-[1.01] text-white/90'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">
                              รางและอุปกรณ์ประกอบทั่วไป
                            </span>
                            {activeAccTab === 'all' && (
                              <span className="text-[9px] font-black bg-indigo-600 text-amber-300 px-1.5 py-0.5 rounded-md animate-pulse">กำลังเลือกคำนวณ</span>
                            )}
                          </div>
                          <p className="text-xl font-black text-amber-400">
                            {formatCurrency(totalGeneralValue)}
                          </p>
                          <p className="text-[10px] text-slate-350 font-bold mt-1">
                            จำนวนรวม {formatNumber(totalGeneralQty, 1)} หน่วยบริการ
                          </p>
                        </div>

                        {/* Tab 2: Roller Blinds */}
                        <div
                          onClick={() => setActiveAccTab('roller')}
                          className={`rounded-2xl p-4 cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
                            activeAccTab === 'roller'
                              ? 'bg-sky-100/95 border-2 border-sky-400 ring-2 ring-sky-500 ring-offset-2 scale-[1.02] shadow-md'
                              : 'bg-sky-50 border border-sky-150 opacity-60 saturate-50 hover:opacity-95 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black tracking-wider uppercase block ${
                              activeAccTab === 'roller' ? 'text-sky-900' : 'text-sky-700'
                            }`}>
                              ม่านม้วนสะสม (Roller Blinds)
                            </span>
                            {activeAccTab === 'roller' && (
                              <span className="text-[9px] font-black bg-sky-600 text-white px-1.5 py-0.5 rounded-md animate-pulse">กำลังเลือกคำนวณ</span>
                            )}
                          </div>
                          <p className="text-xl font-black text-sky-950">
                            {formatCurrency(totalRollersValue)}
                          </p>
                          <p className="text-[10px] text-sky-600 font-bold mt-1">
                            จำนวนสะสม {formatNumber(totalRollersQty, 0)} ผืน/ชุด
                          </p>
                        </div>

                        {/* Tab 3: Venetian Blinds */}
                        <div
                          onClick={() => setActiveAccTab('venetian')}
                          className={`rounded-2xl p-4 cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
                            activeAccTab === 'venetian'
                              ? 'bg-amber-100/95 border-2 border-amber-400 ring-2 ring-amber-500 ring-offset-2 scale-[1.02] shadow-md'
                              : 'bg-amber-50 border border-amber-150 opacity-60 saturate-50 hover:opacity-95 hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black tracking-wider uppercase block ${
                              activeAccTab === 'venetian' ? 'text-amber-900' : 'text-amber-700'
                            }`}>
                              มู่ลี่สะสม (Venetian Blinds)
                            </span>
                            {activeAccTab === 'venetian' && (
                              <span className="text-[9px] font-black bg-amber-600 text-white px-1.5 py-0.5 rounded-md animate-pulse">กำลังเลือกคำนวณ</span>
                            )}
                          </div>
                          <p className="text-xl font-black text-amber-950">
                            {formatCurrency(totalVenetiansValue)}
                          </p>
                          <p className="text-[10px] text-amber-600 font-bold mt-1">
                            จำนวนสะสม {formatNumber(totalVenetiansQty, 0)} ผืน/ชุด
                          </p>
                        </div>
                      </div>

                      {/* Content sections based on activeAccTab */}
                      {activeAccTab === 'all' && (
                        <>
                          {/* Top Tracks/Rails Summary Table */}
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 border border-slate-150 p-4 rounded-xl gap-2">
                              <div>
                                <h4 className="text-xs font-black text-slate-705 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
                                  วิเคราะห์สถิติยอดจำหน่ายรางและอุปกรณ์ประกอบทั่วไป (เรียงตามมูลค่ารวมจากมากไปน้อย)
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                  สรุปว่าราง/อุปกรณ์ประเภทใดถูกจัดใช้สูงสุดในระบบในช่วงเวลาที่เลือกบัดนี้
                                </p>
                              </div>
                              <span className="text-[10px] font-black bg-indigo-55 text-indigo-700 border border-indigo-150 px-2.5 py-1 rounded-md self-start sm:self-auto">
                                รวม {sortedTracks.length} ชนิดรายการ
                              </span>
                            </div>

                            {sortedTracks.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[250px] overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px] sticky top-0 z-10">
                                    <tr>
                                      <th className="px-4 py-3 bg-slate-50 w-12 text-center text-[10px]">อันดับ</th>
                                      <th className="px-4 py-3 bg-slate-50">แบบประเภทรางและอุปกรณ์ประกอบ</th>
                                      <th className="px-4 py-3 text-right bg-slate-50">จำนวนหน่วย</th>
                                      <th className="px-4 py-3 text-right bg-slate-50">จำนวนคำสั่งผลิต</th>
                                      <th className="px-4 py-3 text-right bg-slate-50">มูลค่ารวมสะสม</th>
                                      <th className="px-4 py-3 text-right bg-slate-50">สัดส่วนยอดขาย</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium pb-2">
                                    {sortedTracks.map((item, idx) => {
                                      const ratio = totalGeneralValue > 0 ? (item.total / totalGeneralValue) * 100 : 0;
                                      return (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9.5px] font-black ${
                                              idx === 0 ? 'bg-amber-100 text-amber-700' :
                                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                                              'bg-slate-100 text-slate-400'
                                            }`}>
                                              {idx + 1}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="font-extrabold text-slate-750 block">{item.desc}</span>
                                          </td>
                                          <td className="px-4 py-3 text-right text-indigo-700 font-bold">
                                            {formatNumber(item.qty, 1)} {item.unit}
                                          </td>
                                          <td className="px-4 py-3 text-right text-slate-400 font-semibold">{item.bookings} ครั้ง</td>
                                          <td className="px-4 py-3 text-right font-black text-emerald-600">
                                            {formatCurrency(item.total)}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <div className="w-12 bg-slate-200/60 rounded-full h-2 overflow-hidden">
                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ratio}%` }}></div>
                                              </div>
                                              <span className="text-[10px] font-mono text-slate-450 font-black w-8 text-right">
                                                {formatNumber(ratio, 1)}%
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-4 text-center bg-slate-50 border border-slate-150 rounded-xl text-slate-400 font-bold">
                                ไม่มีข้อมูลรายการรางและอุปกรณ์จัดส่งในช่วงเวลานี้
                              </div>
                            )}
                          </div>

                          {/* Split Grid for Roller Blinds & Venetian Blinds */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                            {/* Roller Blinds Table */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                <span className="w-3 h-3 rounded-md bg-sky-500 inline-block shrink-0"></span>
                                ตารางข้อมูลม่านม้วน (Roller Blinds Details)
                              </h4>

                              {rollerBlinds.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
                                  <table className="w-full text-[11px] text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px] sticky top-0 z-10">
                                      <tr>
                                        <th className="px-3 py-2.5 bg-slate-50">ใบงานอ้างอิง / ลูกค้า</th>
                                        <th className="px-3 py-2.5 bg-slate-50">รายละเอียดผืนม่านม้วน</th>
                                        <th className="px-3 py-2.5 bg-slate-50 text-right">จำนวน</th>
                                        <th className="px-3 py-2.5 bg-slate-50 text-right">สุทธิหลังลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                      {rollerBlinds.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/55">
                                          <td className="px-3 py-2.5">
                                            <span className="font-bold text-slate-805 block text-[10px]">{item.quotationNo}</span>
                                            <span className="text-[9.5px] text-slate-400 font-semibold block">{item.customer}</span>
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span className="font-semibold text-slate-650 block leading-tight">{item.desc}</span>
                                            <span className="text-[9.5px] text-slate-450 block font-bold mt-0.5">ห้อง: {item.room}</span>
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black text-sky-700">{formatNumber(item.qty, 1)} {item.unit}</td>
                                          <td className="px-3 py-2.5 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-8 text-center bg-slate-50/45 border border-slate-150 rounded-xl text-slate-400 font-bold">
                                  ไม่มีบันทึกข้อมูลม่านม้วนในช่วงเวลานี้
                                </div>
                              )}
                            </div>

                            {/* Venetian Blinds Table */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block shrink-0"></span>
                                ตารางข้อมูลมู่ลี่ (Venetian Blinds Details)
                              </h4>

                              {venetianBlinds.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
                                  <table className="w-full text-[11px] text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px] sticky top-0 z-10">
                                      <tr>
                                        <th className="px-3 py-2.5 bg-slate-50">ใบงานอ้างอิง / ลูกค้า</th>
                                        <th className="px-3 py-2.5 bg-slate-50">รายละเอียดตัวมู่ลี่</th>
                                        <th className="px-3 py-2.5 bg-slate-50 text-right">จำนวน</th>
                                        <th className="px-3 py-2.5 bg-slate-50 text-right">สุทธิหลังลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                      {venetianBlinds.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/55">
                                          <td className="px-3 py-2.5">
                                            <span className="font-bold text-slate-805 block text-[10px]">{item.quotationNo}</span>
                                            <span className="text-[9.5px] text-slate-400 font-semibold block">{item.customer}</span>
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <span className="font-semibold text-slate-650 block leading-tight">{item.desc}</span>
                                            <span className="text-[9.5px] text-slate-450 block font-bold mt-0.5">ห้อง: {item.room}</span>
                                          </td>
                                          <td className="px-3 py-2.5 text-right font-black text-amber-700">{formatNumber(item.qty, 1)} {item.unit}</td>
                                          <td className="px-3 py-2.5 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-8 text-center bg-slate-50/45 border border-slate-150 rounded-xl text-slate-400 font-bold">
                                  ไม่มีบันทึกข้อมูลมู่ลี่ในช่วงเวลานี้
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {activeAccTab === 'roller' && (
                        <div className="space-y-6">
                          {/* Roller Blinds Aggregated summary table */}
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-sky-50 border border-sky-150 p-4 rounded-xl gap-2">
                              <div>
                                <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block animate-pulse"></span>
                                  วิเคราะห์มิติสินค้าม่านม้วน (Roller Blinds) ที่จำหน่ายได้ (เรียงจากมากไปน้อยตามจำนวนผืนที่ขาย)
                                </h4>
                                <p className="text-[10px] text-sky-700 font-bold mt-0.5">
                                  แสดงรายการม่านม้วนที่ขายได้พร้อมจำนวนที่จำหน่ายสะสม จัดเรียงจากมากไปน้อยตามคำสั่งผลิตจริง
                                </p>
                              </div>
                              <span className="text-[10px] font-black bg-sky-600 text-white px-2.5 py-1 rounded-md self-start sm:self-auto">
                                รวม {sortedRollers.length} รายการโมเดล
                              </span>
                            </div>

                            {sortedRollers.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-sky-100 max-h-[280px] overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-sky-50/80 text-sky-900 font-bold border-b border-sky-100 text-[10px] sticky top-0 z-10">
                                    <tr>
                                      <th className="px-4 py-3 bg-sky-50 w-12 text-center text-[10px]">อันดับ</th>
                                      <th className="px-4 py-3 bg-sky-50">โมเดล/สไตล์ รายการม่านม้วน</th>
                                      <th className="px-4 py-3 text-right bg-sky-50">จำนวนผืนรวม</th>
                                      <th className="px-4 py-3 text-right bg-sky-50">จำนวนครั้งคำสั่งผลิต</th>
                                      <th className="px-4 py-3 text-right bg-sky-50">มูลค่ารวมสะสม</th>
                                      <th className="px-4 py-3 text-right bg-sky-50">สัดส่วนในกลุ่มม่านม้วน</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-sky-100 font-medium">
                                    {sortedRollers.map((item, idx) => {
                                      const ratio = totalRollersValue > 0 ? (item.total / totalRollersValue) * 100 : 0;
                                      return (
                                        <tr key={idx} className="hover:bg-sky-50/40">
                                          <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9.5px] font-black bg-sky-100 text-sky-700">
                                              {idx + 1}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="font-extrabold text-sky-950 block">{item.desc}</span>
                                          </td>
                                          <td className="px-4 py-3 text-right text-sky-800 font-black">
                                            {formatNumber(item.qty, 1)} {item.unit}
                                          </td>
                                          <td className="px-4 py-3 text-right text-sky-600 font-semibold">{item.bookings} ครั้ง</td>
                                          <td className="px-4 py-3 text-right font-black text-emerald-600">
                                            {formatCurrency(item.total)}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <div className="w-12 bg-sky-200/50 rounded-full h-2 overflow-hidden">
                                                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${ratio}%` }}></div>
                                              </div>
                                              <span className="text-[10px] font-mono text-sky-800 font-black w-8 text-right">
                                                {formatNumber(ratio, 1)}%
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-sky-50/20 border border-sky-100 rounded-xl text-sky-400 font-bold">
                                ไม่มีข้อมูลสรุปม่านม้วนจัดใช้ในช่วงเวลานี้
                              </div>
                            )}
                          </div>

                          {/* Roller Blinds list details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-sky-100 pb-2">
                              <span className="w-3 h-3 rounded-md bg-sky-500 inline-block shrink-0"></span>
                              ตารางข้อมูลม่านม้วนแยกตามใบงานธุรกรรม (Roller Blinds Details)
                            </h4>

                            {rollerBlinds.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-sky-100 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-[11px] text-left">
                                  <thead className="bg-sky-50/70 text-sky-900 font-bold border-b border-sky-100 text-[10px] sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2.5 bg-sky-50">ใบงานอ้างอิง / ลูกค้า</th>
                                      <th className="px-3 py-2.5 bg-sky-50">รายละเอียดผืนม่านม้วน</th>
                                      <th className="px-3 py-2.5 bg-sky-50 text-right">จำนวน</th>
                                      <th className="px-3 py-2.5 bg-sky-50 text-right">สุทธิหลังลด</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-sky-100 font-medium">
                                    {rollerBlinds.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-sky-50/50">
                                        <td className="px-3 py-2.5">
                                          <span className="font-bold text-sky-950 block text-[10px]">{item.quotationNo}</span>
                                          <span className="text-[9.5px] text-sky-600 font-semibold block">{item.customer}</span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <span className="font-semibold text-slate-650 block leading-tight">{item.desc}</span>
                                          <span className="text-[9.5px] text-slate-450 block font-bold mt-0.5">ห้อง: {item.room}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-black text-sky-700">{formatNumber(item.qty, 1)} {item.unit}</td>
                                        <td className="px-3 py-2.5 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-slate-50/45 border border-slate-150 rounded-xl text-slate-400 font-bold">
                                ไม่มีบันทึกข้อมูลม่านม้วนในช่วงเวลานี้
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeAccTab === 'venetian' && (
                        <div className="space-y-6">
                          {/* Venetian Blinds Aggregated summary table */}
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-amber-50 border border-amber-150 p-4 rounded-xl gap-2">
                              <div>
                                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block animate-pulse"></span>
                                  วิเคราะห์มิติสินค้ามู่ลี่ (Venetian Blinds) ที่จำหน่ายได้ (เรียงจากมากไปน้อยตามจำนวนชุดที่ขาย)
                                </h4>
                                <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                                  แสดงรายการรูปแบบสเปคมู่ลี่ที่ขายได้พร้อมจำนวนที่จำหน่ายสะสม จัดเรียงจากมากไปน้อยตามคำสั่งผลิตจริง
                                </p>
                              </div>
                              <span className="text-[10px] font-black bg-amber-600 text-white px-2.5 py-1 rounded-md self-start sm:self-auto">
                                รวม {sortedVenetians.length} รายการโมเดล
                              </span>
                            </div>

                            {sortedVenetians.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-amber-100 max-h-[280px] overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-amber-50/80 text-amber-900 font-bold border-b border-amber-100 text-[10px] sticky top-0 z-10">
                                    <tr>
                                      <th className="px-4 py-3 bg-amber-50 w-12 text-center text-[10px]">อันดับ</th>
                                      <th className="px-4 py-3 bg-amber-50">โมเดล/สไตล์ รายการมู่ลี่</th>
                                      <th className="px-4 py-3 text-right bg-amber-50">จำนวนชุดรวม</th>
                                      <th className="px-4 py-3 text-right bg-amber-50">จำนวนครั้งคำสั่งผลิต</th>
                                      <th className="px-4 py-3 text-right bg-amber-50">มูลค่ารวมสะสม</th>
                                      <th className="px-4 py-3 text-right bg-amber-50">สัดส่วนในกลุ่มมู่ลี่</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-amber-100 font-medium">
                                    {sortedVenetians.map((item, idx) => {
                                      const ratio = totalVenetiansValue > 0 ? (item.total / totalVenetiansValue) * 100 : 0;
                                      return (
                                        <tr key={idx} className="hover:bg-amber-50/40">
                                          <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9.5px] font-black bg-amber-100 text-amber-700">
                                              {idx + 1}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="font-extrabold text-amber-950 block">{item.desc}</span>
                                          </td>
                                          <td className="px-4 py-3 text-right text-amber-800 font-black">
                                            {formatNumber(item.qty, 1)} {item.unit}
                                          </td>
                                          <td className="px-4 py-3 text-right text-amber-600 font-semibold">{item.bookings} ครั้ง</td>
                                          <td className="px-4 py-3 text-right font-black text-emerald-600">
                                            {formatCurrency(item.total)}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <div className="w-12 bg-amber-200/50 rounded-full h-2 overflow-hidden">
                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ratio}%` }}></div>
                                              </div>
                                              <span className="text-[10px] font-mono text-amber-800 font-black w-8 text-right">
                                                {formatNumber(ratio, 1)}%
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-amber-50/20 border border-amber-100 rounded-xl text-slate-400 font-bold">
                                ไม่มีข้อมูลสรุปมู่ลี่จัดใช้ในช่วงเวลานี้
                              </div>
                            )}
                          </div>

                          {/* Venetian Blinds list details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-2">
                              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block shrink-0"></span>
                              ตารางข้อมูลมู่ลี่แยกตามใบงานธุรกรรม (Venetian Blinds Details)
                            </h4>

                            {venetianBlinds.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-amber-100 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-[11px] text-left">
                                  <thead className="bg-amber-50/70 text-amber-900 font-bold border-b border-amber-100 text-[10px] sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2.5 bg-amber-50">ใบงานอ้างอิง / ลูกค้า</th>
                                      <th className="px-3 py-2.5 bg-amber-50">รายละเอียดตัวมู่ลี่</th>
                                      <th className="px-3 py-2.5 bg-amber-50 text-right">จำนวน</th>
                                      <th className="px-3 py-2.5 bg-amber-50 text-right">สุทธิหลังลด</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-amber-100 font-medium">
                                    {venetianBlinds.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-amber-50/50">
                                        <td className="px-3 py-2.5">
                                          <span className="font-bold text-amber-950 block text-[10px]">{item.quotationNo}</span>
                                          <span className="text-[9.5px] text-amber-600 font-semibold block">{item.customer}</span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <span className="font-semibold text-slate-650 block leading-tight">{item.desc}</span>
                                          <span className="text-[9.5px] text-slate-450 block font-bold mt-0.5">ห้อง: {item.room}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-black text-amber-700">{formatNumber(item.qty, 1)} {item.unit}</td>
                                        <td className="px-3 py-2.5 text-right font-black text-emerald-600">{formatCurrency(item.total)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center bg-amber-50/45 border border-amber-150 rounded-xl text-slate-400 font-bold">
                                ไม่มีบันทึกข้อมูลมู่ลี่ในช่วงเวลานี้
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()}

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
                            [...drilldown.data.fabrics].sort((a: any, b: any) => {
                              const valA = drilldownSortField === 'yards' ? a.yards : a.netTotal;
                              const valB = drilldownSortField === 'yards' ? b.yards : b.netTotal;
                              return drilldownSortOrder === 'desc' ? valB - valA : valA - valB;
                            }).map((f: any, idx: number) => {
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
                            [...drilldown.data.fabrics].sort((a: any, b: any) => {
                              const valA = drilldownSortField === 'yards' ? a.yards : a.netTotal;
                              const valB = drilldownSortField === 'yards' ? b.yards : b.netTotal;
                              return drilldownSortOrder === 'desc' ? valB - valA : valA - valB;
                            }).map((f: any, idx: number) => {
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

// Helpers to classify and clean curtain sewing style and materials
function isCurtainSewing(desc: string): boolean {
  if (!desc) return false;
  const upper = desc.toUpperCase();
  if (upper.includes('ม้วน') || upper.includes('มู่ลี่') || upper.includes('ROLLER') || upper.includes('VENETIAN')) {
    return false;
  }
  // Exclude installation/transportation/accessory services if any
  if (upper.includes('ติดตั้ง') || upper.includes('ขนส่ง') || upper.includes('เดินทาง') || upper.includes('รื้อถอน') || upper.includes('ซ่อม') || upper.includes('ราง')) {
    return false;
  }
  return true;
}

function classifySewingStyle(desc: string): string {
  if (!desc) return 'รูปแบบทั่วไป';
  const upper = desc.toUpperCase();
  if (upper.includes('จับจีบ') || upper.includes('จีบ')) {
    return 'จับจีบ';
  }
  if (upper.includes('S-CURVE') || upper.includes('S - CURVE') || upper.includes('S CURVE') || upper.includes('เอสเคิร์ฟ') || upper.includes('ลอน') || upper.includes('CURVE')) {
    return 'S-CURVE';
  }
  if (upper.includes('พับ')) {
    return 'ม่านพับ';
  }
  if (upper.includes('ตาไก่')) {
    return 'ม่านตาไก่';
  }
  if (upper.includes('คอกระเช้า')) {
    return 'ม่านคอกระเช้า';
  }
  
  // Clean up extra text if unknown style
  return desc
    .replace(/ค่าตัดเย็บม่าน/g, '')
    .replace(/ค่าตัดเย็บ/g, '')
    .replace(/ค่าบริการ/g, '')
    .replace(/ม่าน/g, '')
    .replace(/\(ทึบ\)/g, '')
    .replace(/\(โปร่ง\)/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[0-9]+?.*/g, '')
    .trim() || 'รูปแบบทั่วไป';
}

function isSheerCurtain(desc: string): boolean {
  if (!desc) return false;
  const upper = desc.toUpperCase();
  return upper.includes('โปร่ง') || upper.includes('SHEER');
}

function isRollerBlind(desc: string): boolean {
  if (!desc) return false;
  const upper = desc.toUpperCase();
  return upper.includes('ม้วน') || upper.includes('ROLLER');
}

function isVenetianBlind(desc: string): boolean {
  if (!desc) return false;
  const upper = desc.toUpperCase();
  return upper.includes('มู่ลี่') || upper.includes('VENETIAN');
}
