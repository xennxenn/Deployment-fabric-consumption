/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Project, ProjectItem } from '../types';
import ExpandableTable from './ExpandableTable';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
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

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const items = project.items || [];

  // 1. Process Fabrics (Normal vs Wide)
  const processFabrics = (isWideMode: boolean) => {
    const filtered = items.filter((i) => {
      if (i.item_type !== 'F') return false;
      const fabricNodeUpper = i.fabric_name ? i.fabric_name.toUpperCase() : '';
      const isWide = WIDE_FABRICS.includes(fabricNodeUpper) || i.is_wide;
      return isWide === isWideMode;
    });

    const grouped: { [key: string]: any } = {};
    filtered.forEach((i) => {
      const key = i.fabric_name || 'ไม่ระบุชื่อผ้า';
      if (!grouped[key]) {
        grouped[key] = { name: key, totalYards: 0, totalQty: 0, totalNetTotal: 0, details: [] };
      }
      const yards = i.qtyYards || i.qty;
      grouped[key].totalYards += yards;
      grouped[key].totalQty += i.qty;
      grouped[key].totalNetTotal += (i.itemNetTotal || 0);
      grouped[key].details.push({
        color: i.fabric_color || 'ไม่ระบุสี',
        room: i.room_name || 'ไม่ระบุตำแหน่ง',
        yards: yards,
        qty: i.qty,
        itemNetTotal: i.itemNetTotal || 0
      });
    });
    return Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));
  };

  const normalFabricsData = processFabrics(false);
  const wideFabricsData = processFabrics(true);

  // 2. Curtains Data (Exclude Blinds/Rollers)
  const curtainsData = (() => {
    const filtered = items.filter(
      (i) =>
        i.item_type === 'P' &&
        !(i.descriptions.includes('ม้วน') || i.descriptions.includes('มู่ลี่'))
    );
    const grouped: { [key: string]: any } = {};
    filtered.forEach((i) => {
      const key = i.clean_desc || i.descriptions || 'รูปแบบม่านปกติ';
      if (!grouped[key]) {
        grouped[key] = { name: key, totalQty: 0, totalNetTotal: 0, details: [] };
      }
      grouped[key].totalQty += i.qty;
      grouped[key].totalNetTotal += (i.itemNetTotal || 0);
      grouped[key].details.push({
        room: i.room_name || 'ไม่ระบุห้อง',
        qty: i.qty,
        unit: i.unit || 'จุด',
        itemNetTotal: i.itemNetTotal || 0
      });
    });
    return Object.values(grouped);
  })();

  // 3. Blinds Data (Roller or Venetian)
  const blindsData = (() => {
    const filtered = items.filter(
      (i) =>
        (i.item_type === 'P' || i.item_type === 'A') &&
        (i.descriptions.includes('ม้วน') || i.descriptions.includes('มู่ลี่'))
    );
    if (filtered.length === 0) return [];

    const summaryRow: { [key: string]: any } = {};
    filtered.forEach((i) => {
      let type = 'ม่านม้วนหรือมู่ลี่สำเร็จรูป';
      if (i.descriptions.includes('ม้วน')) {
        type = 'ม่านม้วน (Roller Blinds)';
      } else if (i.descriptions.includes('มู่ลี่')) {
        type = 'มู่ลี่ (Venetian Blinds)';
      }

      if (!summaryRow[type]) {
        summaryRow[type] = { name: type, totalSqm: 0, totalSets: 0, totalNetTotal: 0, details: [] };
      }
      summaryRow[type].totalSqm += i.qty; // sqm
      summaryRow[type].totalSets += 1;
      summaryRow[type].totalNetTotal += (i.itemNetTotal || 0);
      summaryRow[type].details.push({
        desc: i.descriptions,
        room: i.room_name || 'ไม่ระบุห้อง',
        sqm: i.qty,
        unit: i.unit || 'ตร.ม.',
        itemNetTotal: i.itemNetTotal || 0
      });
    });
    return Object.values(summaryRow);
  })();

  // 4. Accessories and Tracks (Exclude Blinds/Rollers)
  const accData = (() => {
    const filtered = items.filter(
      (i) =>
        i.item_type === 'A' &&
        !(i.descriptions.includes('ม้วน') || i.descriptions.includes('มู่ลี่'))
    );
    const grouped: { [key: string]: any } = {};
    filtered.forEach((i) => {
      const key = i.descriptions || 'อุปกรณ์รางอื่นๆ';
      if (!grouped[key]) {
        grouped[key] = { name: key, totalQty: 0, totalNetTotal: 0, unit: i.unit || 'เส้น', details: [] };
      }
      grouped[key].totalQty += i.qty;
      grouped[key].totalNetTotal += (i.itemNetTotal || 0);
      grouped[key].details.push({
        room: i.room_name || 'ไม่ระบุห้อง',
        qty: i.qty,
        unit: i.unit || 'เส้น',
        itemNetTotal: i.itemNetTotal || 0
      });
    });
    return Object.values(grouped);
  })();

  return (
    <div className="space-y-8">
      {/* 🧭 Back Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            โครงการเลขใบเสนอราคา {project.quotation_no}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Breakdown & Fabrication Details (สรุปประวัติสูตรและผังห้อง)
          </p>
        </div>
      </div>

      {/* 🏡 S1: Client Details vs S2: Money Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <User className="w-4 h-4 text-indigo-500" /> สระสรุปแฟ้มประวัติข้อมูลลูกค้า
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ชื่อเจ้าบ้าน / นามผู้สั่งทำ</p>
              <p className="text-base font-black text-slate-800">{project.customerName || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">เบอร์ผู้ติดต่อประสานงาน</p>
              <p className="text-base font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" /> {project.cs_phone || 'ไม่ได้ระบุ'}
              </p>
            </div>
            <div className="sm:col-span-2 bg-slate-50/55 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">พื้นที่พิกัดสถานที่วัด / ติดตั้ง</p>
              <p className="text-xs font-semibold text-slate-600 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  {project.address || '-'} จ. {project.province || '-'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ผู้สํารวจวัดงาน / ขาย</p>
              <p className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg inline-block">
                {project.sale_id || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">วันที่ยืนยันเอกสาร</p>
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {project.confirm_date || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl shadow-md border border-slate-800 p-6 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pb-3 border-b border-white/5">
              มูลค่าแยกหมวดหมู่โรงงาน
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">ค่าเนื้อผ้า (F)</span>
                <span className="font-bold text-slate-200">{formatCurrency(project.total_F)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">ค่าตัดเย็บ & ซอฟต์คอนเฟิร์ม (P)</span>
                <span className="font-bold text-slate-200">{formatCurrency(project.total_P)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">ค่ารางเหล็ก อลูมิเนียม & อะไหล่ (A)</span>
                <span className="font-bold text-slate-200">{formatCurrency(project.total_A)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">ยอดสุทธิรับเหมาติดตั้ง</p>
            <p className="text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(project.netTotal)}
            </p>
            {project.discount_round > 0 && (
              <p className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg mt-3 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> ส่วนลดลดปัดเศษ: {formatCurrency(project.discount_round)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 📦 S2: Section Production Categories */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-5.5 h-5.5 text-indigo-600" />
          <div>
            <h3 className="text-md font-bold text-slate-800">
              รายละเอียดและคำสั่งผลิตรวมรายวัตถุดิบ
            </h3>
            <p className="text-xs text-slate-400">จัดกลุ่มวัตถุดิบแยกแฝงเพื่อการส่งงานฝ่ายช่างตัดชิ้นผลิต</p>
          </div>
        </div>

        <ExpandableTable
          title="1. หมวดเนื้อผ้าปกติ (ความสูงหน้ามาตรฐานทั่วไป 1.50m - 2.00m)"
          data={normalFabricsData}
          type="fabric"
        />

        <ExpandableTable
          title="2. หมวดผ้าหน้ากว้างพิเศษ (ความสูงหน้าผ้า 2.80m - 3.30m ขึ้นไป)"
          data={wideFabricsData}
          type="fabric"
        />

        <ExpandableTable
          title="3. หมวดคํานวณสัญกรณ์รูปแบบการตัดเย็บม่าน"
          data={curtainsData}
          type="curtain"
        />

        <ExpandableTable
          title="4. หมวดม่านม้วน สําเร็จรูป และ มู่ลี่ปรับแสง"
          data={blindsData}
          type="blind"
        />

        <ExpandableTable
          title="5. หมวดอุปกรณ์ ราง และ อะไหล่อื่นๆ"
          data={accData}
          type="accessory"
        />
      </div>
    </div>
  );
}
