/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  UserCheck
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
import { Project } from '../types';
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

interface DashboardViewProps {
  projects: Project[];
}

export default function DashboardView({ projects }: DashboardViewProps) {
  const [selectedFabricData, setSelectedFabricData] = useState<{
    name: string;
    colors: { colorName: string; yards: number; netTotal: number }[];
    total: number;
    totalNetTotal: number;
  } | null>(null);

  const projectCount = projects.length || 1;
  let totalNetSales = 0;
  let totalF = 0;
  let totalP = 0;
  let totalA = 0;
  let totalNormalFabricYards = 0;
  let totalWideFabricYards = 0;
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

  projects.forEach((p) => {
    totalNetSales += p.netTotal;
    totalF += p.total_F || 0;
    totalP += p.total_P || 0;
    totalA += p.total_A || 0;

    const prov = p.province || 'ไม่ระบุ';
    if (!provinceMap[prov]) provinceMap[prov] = { sales: 0, count: 0 };
    provinceMap[prov].sales += p.netTotal;
    provinceMap[prov].count += 1;

    const emp = (p.sale_id && p.sale_id.split('(')[0].trim()) || 'ไม่ระบุพนักงาน';
    if (!employeeMap[emp]) employeeMap[emp] = { sales: 0, count: 0 };
    employeeMap[emp].sales += p.netTotal;
    employeeMap[emp].count += 1;

    p.items.forEach((item) => {
      const isFabricComponent = item.item_type === 'F';
      if (isFabricComponent) {
        const yards = item.qtyYards || item.qty;
        const fabricNodeUpper = item.fabric_name ? item.fabric_name.toUpperCase() : '';
        const isWide = WIDE_FABRICS.includes(fabricNodeUpper) || item.is_wide;

        if (isWide) {
          totalWideFabricYards += yards;
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

  const topFabrics = Object.entries(fabricMap)
    .map(([name, data]) => ({
      name,
      yards: data.totalYards,
      netTotal: data.totalNetTotal,
      colors: data.colors
    }))
    .sort((a, b) => b.yards - a.yards)
    .slice(0, 15);

  const provinceData = Object.entries(provinceMap)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      count: data.count
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const employeeData = Object.entries(employeeMap)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      count: data.count
    }))
    .sort((a, b) => b.sales - a.sales);

  let clickTimeout: any = null;
  const handleBarClick = (data: any) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      const colorArr = Object.entries(data.colors)
        .map(([colorName, colorData]: any) => ({
          colorName,
          yards: colorData.yards as number,
          netTotal: colorData.netTotal as number
        }))
        .sort((a: any, b: any) => b.yards - a.yards);
      setSelectedFabricData({
        name: data.name,
        colors: colorArr,
        total: data.yards,
        totalNetTotal: data.netTotal
      });
    } else {
      clickTimeout = setTimeout(() => {
        clickTimeout = null;
      }, 300);
    }
  };

  return (
    <div className="space-y-8">
      {/* 📊 Section 1: Net Sales Overview */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" /> สรุปยอดวิจัยและยอดขายโครงการทั้งหมด
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="โครงการทั้งหมด"
            value={`${formatNumber(projects.length)} โครงการ`}
            icon={LayoutGrid}
            bgColorClass="bg-slate-900"
            colorClass="text-white"
            subtitle={`เฉลี่ยโครงการละ ${formatCurrency(totalNetSales / projectCount)}`}
          />
          <StatCard
            title="ค่าวัสดุผ้า (F)"
            value={formatCurrency(totalF)}
            icon={PieChartIcon}
            bgColorClass="bg-indigo-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalF / (totalNetSales || 1)) * 100, 1)}% ของยอดรวมทั้งหมด`}
          />
          <StatCard
            title="ค่าตัดเย็บ & บริการ (P)"
            value={formatCurrency(totalP)}
            icon={Scissors}
            bgColorClass="bg-blue-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalP / (totalNetSales || 1)) * 100, 1)}% ของยอดรวมทั้งหมด`}
          />
          <StatCard
            title="ค่าราง & อุปกรณ์ (A)"
            value={formatCurrency(totalA)}
            icon={PenTool}
            bgColorClass="bg-amber-600"
            colorClass="text-white"
            subtitle={`${formatNumber((totalA / (totalNetSales || 1)) * 100, 1)}% ของยอดรวมทั้งหมด`}
          />
        </div>
      </div>

      {/* 📦 Section 2: Production Average per Project */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-500" /> ปริมาณเฉลี่ยการใช้วัตถุดิบและอุปกรณ์ต่อโครงการ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                ผ้าผืนปกติสีพื้น (Normal Fabric)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalNormalFabricYards / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">หลา / งาน</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <PieChartIcon className="text-indigo-600 w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                ผ้าหน้ากว้างพิเศษ (Wide Fabric)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalWideFabricYards / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">หลา / งาน</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <TrendingUp className="text-teal-600 w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-center hover:shadow-sm transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                ม่านม้วน / มู่ลี่สำเร็จรูป (Blinds)
              </p>
              <p className="text-2xl font-black text-slate-800">
                {formatNumber(totalBlindsSqm / projectCount, 1)}{' '}
                <span className="text-xs font-bold text-slate-400">ตร.ม. / งาน</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                เฉลี่ย {formatNumber(totalBlindsSets / projectCount, 1)} ชุดต่อโครงการ
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <LayoutGrid className="text-cyan-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Section 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-md font-bold text-slate-800">Top 15 รุ่นผ้าขายดีและเป็นที่นิยมสูงสุด</h3>
              <p className="text-xs text-slate-400 mt-1">เปรียบเทียบจากจำนวนความยาวหลารวมในระบบ</p>
            </div>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3.5 py-2 rounded-full shadow-2xs">
              💡 ดับเบิ้ลคลิกแท่งดีสเปรย์เพื่อดูสรุปสัดส่วนสี (Fabric Colors Details)
            </span>
          </div>
          <div className="h-[420px]">
            {topFabrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topFabrics}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 20, bottom: 0 }}
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
                    width={110}
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#F8FAFC' }}
                    formatter={(value: any, name: string, props: any) => {
                      const item = props?.payload;
                      const formattedYards = `${formatNumber(value, 2)} หลา`;
                      if (item && item.netTotal !== undefined) {
                        return [
                          `${formattedYards} (ยอดสุทธิหลังส่วนลด: ${formatCurrency(item.netTotal)})`,
                          'ข้อมูลรวมแผ่นยอดขาย'
                        ];
                      }
                      return [formattedYards, 'ความยาวรวม'];
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Bar
                    dataKey="yards"
                    fill="#4F46E5"
                    radius={[0, 6, 6, 0]}
                    onClick={handleBarClick}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <LabelList
                      dataKey="yards"
                      position="right"
                      formatter={(val: number) => `${formatNumber(val, 1)} หลา`}
                      style={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                ยังไม่มีข้อมูลเนื่อผ้าประกอบของใบเสนอราคา
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">ยอดจำหน่ายและผลงานงานแยกตามพนักงาน</h3>
              <p className="text-xs text-slate-400 mt-0.5">เรียงลำดับศักยภาพตามยอดสุทธิโครงการ</p>
            </div>
          </div>
          <div className="h-[350px]">
            {employeeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeeData}
                  layout="vertical"
                  margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
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
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#F8FAFC' }}
                    formatter={(value: any) => [`${formatCurrency(value)}`, 'ยอดขายสุทธิ']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0'
                    }}
                  />
                  <Bar dataKey="sales" fill="#10B981" radius={[0, 6, 6, 0]}>
                    <LabelList
                      dataKey="sales"
                      position="right"
                      formatter={(val: number) => formatCurrency(val)}
                      style={{ fill: '#334155', fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                ยังไม่มีข้อมูลพนักงาน
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">ตลาดและการขยายตัวรายจังหวัด</h3>
              <p className="text-xs text-slate-400 mt-0.5">Top 10 จังหวัดแรกที่มียอดมูลค่าโครงการสะสมสูงสุด</p>
            </div>
          </div>
          <div className="h-[350px]">
            {provinceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={provinceData}
                  layout="vertical"
                  margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
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
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#F8FAFC' }}
                    formatter={(value: any) => [`${formatCurrency(value)}`, 'ตลาดสะสม']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0'
                    }}
                  />
                  <Bar dataKey="sales" fill="#F59E0B" radius={[0, 6, 6, 0]}>
                    <LabelList
                      dataKey="sales"
                      position="right"
                      formatter={(val: number) => formatCurrency(val)}
                      style={{ fill: '#334155', fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                ยังไม่มีข้อมูลตลาดพิกัดรายจังหวัด
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎨 Double-click Detail Modal for Fabric Colors */}
      {selectedFabricData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <div>
                <h3 className="font-bold text-base text-indigo-950">
                  สัดส่วนสีผ้า: {selectedFabricData.name}
                </h3>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">
                  ความยาวทั้งหมด: {formatNumber(selectedFabricData.total, 2)} หลา (สุทธิสะสม: {formatCurrency(selectedFabricData.totalNetTotal)})
                </p>
              </div>
              <button
                onClick={() => setSelectedFabricData(null)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors bg-white/70 shadow-2xs border border-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-2">
              {selectedFabricData.colors.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-xl border border-slate-100"
                >
                  <div>
                    <span className="font-bold text-slate-700 block">{c.colorName}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      หลังหักส่วนลดสะสม: {formatCurrency(c.netTotal)}
                    </span>
                  </div>
                  <span className="font-extrabold text-indigo-600 text-sm shrink-0">
                    {formatNumber(c.yards, 2)}{' '}
                    <span className="text-[10px] font-bold text-slate-400 ml-1">หลา</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
