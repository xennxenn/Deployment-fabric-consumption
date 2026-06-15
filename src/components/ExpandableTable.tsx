/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const formatNumber = (num: number, decimals: number = 0) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num || 0);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

interface ExpandableTableProps {
  title: string;
  data: any[];
  type: 'fabric' | 'curtain' | 'blind' | 'accessory';
}

export default function ExpandableTable({ title, data, type }: ExpandableTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-50/50 rounded-xl px-5 py-6 border border-dashed border-slate-200 text-center text-slate-400 text-sm">
         ไม่มีข้อมูลชิ้นงานใน {title}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100" id={`expandable-${type}`}>
      <div className="bg-slate-50/60 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
          {title}
        </span>
        <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-2xs flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> ดับเบิ้ลคลิกแถวเพื่อดูรายละเอียดรายห้อง/สี
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white text-slate-400 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 w-12 text-center"></th>
              {type === 'fabric' && (
                <>
                  <th className="px-5 py-3">รุ่นผ้าและรายละเอียด</th>
                  <th className="px-5 py-3 text-right">จำนวนหลารวม</th>
                  <th className="px-5 py-3 text-right">จำนวนชิ้นงานรวม</th>
                  <th className="px-5 py-3 text-right">ยอดรวมหลังส่วนลด</th>
                </>
              )}
              {type === 'curtain' && (
                <>
                  <th className="px-5 py-3">ประเภทผ้าม่านและวิธีการตัดเย็บ</th>
                  <th className="px-5 py-3 text-right">จำนวนชิ้นรวม</th>
                  <th className="px-5 py-3 text-right">ยอดรวมหลังส่วนลด</th>
                </>
              )}
              {type === 'blind' && (
                <>
                  <th className="px-5 py-3">หมวดหมู่ชุดม่านม้วน / มู่ลี่สำเร็จรูป</th>
                  <th className="px-5 py-3 text-right">รวมพื้นที่ (ตร.ม.)</th>
                  <th className="px-5 py-3 text-right">จำนวนชุด</th>
                  <th className="px-5 py-3 text-right">ยอดรวมหลังส่วนลด</th>
                </>
              )}
              {type === 'accessory' && (
                <>
                  <th className="px-5 py-3">รายการราง และอุปกรณ์ประกอบ</th>
                  <th className="px-5 py-3 text-right">จำนวนรวม</th>
                  <th className="px-5 py-3 text-center">หน่วย</th>
                  <th className="px-5 py-3 text-right">ยอดรวมหลังส่วนลด</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((group, idx) => {
              const isExpanded = expandedRows.has(idx);
              return (
                <React.Fragment key={idx}>
                  <tr
                    className={`hover:bg-slate-50/50 cursor-pointer transition-colors select-none ${
                      isExpanded ? 'bg-slate-50/30' : ''
                    }`}
                    onDoubleClick={() => toggleRow(idx)}
                  >
                    <td
                      className="px-5 py-4 text-center text-slate-400"
                      onClick={() => toggleRow(idx)}
                    >
                      <button className="focus:outline-none">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {type === 'fabric' && (
                      <>
                        <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">
                          {group.name}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-indigo-600 text-[14px]">
                          {formatNumber(group.totalYards, 2)} หลา
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500 font-medium">
                          {formatNumber(group.totalQty)} ชิ้น
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-600 text-[14px]">
                          {formatCurrency(group.totalNetTotal)}
                        </td>
                      </>
                    )}

                    {type === 'curtain' && (
                      <>
                        <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">
                          {group.name}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-blue-600 text-[14px]">
                          {formatNumber(group.totalQty)} ชิ้น
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-600 text-[14px]">
                          {formatCurrency(group.totalNetTotal)}
                        </td>
                      </>
                    )}

                    {type === 'blind' && (
                      <>
                        <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">
                          {group.name}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-teal-600 text-[14px]">
                          {formatNumber(group.totalSqm, 2)} ตร.ม.
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500 font-medium">
                          {formatNumber(group.totalSets)} ชุด
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-600 text-[14px]">
                          {formatCurrency(group.totalNetTotal)}
                        </td>
                      </>
                    )}

                    {type === 'accessory' && (
                      <>
                        <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">
                          {group.name}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-600 text-[14px]">
                          {formatNumber(group.totalQty, 2)}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-400 font-bold text-xs uppercase">
                          {group.unit || 'ชิ้น'}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-600 text-[14px]">
                          {formatCurrency(group.totalNetTotal)}
                        </td>
                      </>
                    )}
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-50/30">
                      <td></td>
                      <td
                        colSpan={
                          type === 'fabric'
                            ? 4
                            : type === 'blind'
                            ? 4
                            : type === 'curtain'
                            ? 3
                            : 4
                        }
                        className="p-0 border-t border-slate-100"
                      >
                        <AnimatePresence>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 py-4 overflow-hidden"
                          >
                            {type === 'fabric' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                                  <div className="bg-indigo-50/50 px-4 py-2 font-bold text-indigo-900 text-xs border-b border-indigo-100">
                                    สรุปแยกตามรหัสสี (Fabric Colors)
                                  </div>
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold">
                                      <tr>
                                        <th className="px-4 py-2.5">รหัสสี</th>
                                        <th className="px-4 py-2.5 text-right">ความยาว (หลา)</th>
                                        <th className="px-4 py-2.5 text-right">จำนวน (ชิ้น)</th>
                                        <th className="px-4 py-2.5 text-right">ยอดรวมหลังส่วนลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {Object.values(
                                        group.details.reduce((acc: any, d: any) => {
                                          const k = d.color || 'ไม่ระบุ';
                                          if (!acc[k]) {
                                            acc[k] = { name: k, yards: 0, qty: 0, itemNetTotal: 0 };
                                          }
                                          acc[k].yards += d.yards;
                                          acc[k].qty += d.qty;
                                          acc[k].itemNetTotal += d.itemNetTotal || 0;
                                          return acc;
                                        }, {})
                                      )
                                        .sort((a: any, b: any) => b.yards - a.yards)
                                        .map((c: any, i: number) => (
                                          <tr key={i} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-2 font-semibold text-slate-700">
                                              {c.name}
                                            </td>
                                            <td className="px-4 py-2 text-right text-indigo-600 font-bold">
                                              {formatNumber(c.yards, 2)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-500 font-medium">
                                              {formatNumber(c.qty)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                                              {formatCurrency(c.itemNetTotal)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                                  <div className="bg-teal-50/50 px-4 py-2 font-bold text-teal-900 text-xs border-b border-teal-100">
                                    สรุปแยกตามโซนห้อง (Locations / Rooms)
                                  </div>
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold">
                                      <tr>
                                        <th className="px-4 py-2.5">ห้อง / ตำบล</th>
                                        <th className="px-4 py-2.5 text-right">ความยาว (หลา)</th>
                                        <th className="px-4 py-2.5 text-right">จำนวน (ชิ้น)</th>
                                        <th className="px-4 py-2.5 text-right">ยอดรวมหลังส่วนลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {Object.values(
                                        group.details.reduce((acc: any, d: any) => {
                                          const k = d.room || 'ไม่ระบุโซน';
                                          if (!acc[k]) {
                                            acc[k] = { name: k, yards: 0, qty: 0, itemNetTotal: 0 };
                                          }
                                          acc[k].yards += d.yards;
                                          acc[k].qty += d.qty;
                                          acc[k].itemNetTotal += d.itemNetTotal || 0;
                                          return acc;
                                        }, {})
                                      )
                                        .sort((a: any, b: any) => b.yards - a.yards)
                                        .map((r: any, i: number) => (
                                          <tr key={i} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-2 text-slate-700 font-medium">
                                              {r.name}
                                            </td>
                                            <td className="px-4 py-2 text-right text-teal-600 font-bold">
                                              {formatNumber(r.yards, 2)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-500">
                                              {formatNumber(r.qty)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                                              {formatCurrency(r.itemNetTotal)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {type === 'blind' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                                  <div className="bg-blue-50/50 px-4 py-2 font-bold text-blue-900 text-xs border-b border-blue-100">
                                    สรุปรายละเอียดรายชิ้นและรุ่น
                                  </div>
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold">
                                      <tr>
                                        <th className="px-4 py-2.5">รุ่น / ขนาดม่าน</th>
                                        <th className="px-4 py-2.5 text-right">พื้นที่ (ตร.ม.)</th>
                                        <th className="px-4 py-2.5 text-right">จำนวนชุด</th>
                                        <th className="px-4 py-2.5 text-right">ยอดรวมหลังส่วนลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {Object.values(
                                        group.details.reduce((acc: any, d: any) => {
                                          const k = d.desc || 'ไม่ระบุ';
                                          if (!acc[k]) {
                                            acc[k] = { name: k, sqm: 0, sets: 0, itemNetTotal: 0 };
                                          }
                                          acc[k].sqm += d.sqm;
                                          acc[k].sets += 1;
                                          acc[k].itemNetTotal += d.itemNetTotal || 0;
                                          return acc;
                                        }, {})
                                      )
                                        .sort((a: any, b: any) => b.sqm - a.sqm)
                                        .map((c: any, i: number) => (
                                          <tr key={i} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-2 font-semibold text-slate-700 max-w-xs truncate">
                                              {c.name}
                                            </td>
                                            <td className="px-4 py-2 text-right text-blue-600 font-bold">
                                              {formatNumber(c.sqm, 2)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-500 font-medium">
                                              {formatNumber(c.sets)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                                              {formatCurrency(c.itemNetTotal)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                                  <div className="bg-teal-50/50 px-4 py-2 font-bold text-teal-900 text-xs border-b border-teal-100">
                                    สรุปพื้นที่ตามโซนห้อง
                                  </div>
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold">
                                      <tr>
                                        <th className="px-4 py-2.5">ห้อง / โซน</th>
                                        <th className="px-4 py-2.5 text-right">พื้นที่ (ตร.ม.)</th>
                                        <th className="px-4 py-2.5 text-right">จำนวนชุด</th>
                                        <th className="px-4 py-2.5 text-right">ยอดรวมหลังส่วนลด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {Object.values(
                                        group.details.reduce((acc: any, d: any) => {
                                          const k = d.room || 'ไม่ระบุห้อง';
                                          if (!acc[k]) {
                                            acc[k] = { name: k, sqm: 0, sets: 0, itemNetTotal: 0 };
                                          }
                                          acc[k].sqm += d.sqm;
                                          acc[k].sets += 1;
                                          acc[k].itemNetTotal += d.itemNetTotal || 0;
                                          return acc;
                                        }, {})
                                      )
                                        .sort((a: any, b: any) => b.sqm - a.sqm)
                                        .map((r: any, i: number) => (
                                          <tr key={i} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-2 text-slate-700 font-medium">
                                              {r.name}
                                            </td>
                                            <td className="px-4 py-2 text-right text-teal-600 font-bold">
                                              {formatNumber(r.sqm, 2)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-500">
                                              {formatNumber(r.sets)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                                              {formatCurrency(r.itemNetTotal)}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {(type === 'curtain' || type === 'accessory') && (
                              <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden w-full max-w-xl">
                                <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 text-xs border-b border-slate-100">
                                  รายละเอียดตำแหน่งห้องและอุปกรณ์ที่ใช้ติดตั้ง
                                </div>
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-slate-400 font-bold">
                                    <tr>
                                      <th className="px-4 py-2.5">ห้อง (Room / Location)</th>
                                      <th className="px-4 py-2.5 text-right">จำนวนงาน</th>
                                      <th className="px-4 py-2.5 text-right">ยอดรวมหลังส่วนลด</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {Object.values(
                                      group.details.reduce((acc: any, d: any) => {
                                        const k = d.room || 'ไม่ระบุตำแหน่ง';
                                        if (!acc[k]) {
                                          acc[k] = { name: k, qty: 0, unit: d.unit || 'ชิ้น', itemNetTotal: 0 };
                                        }
                                        acc[k].qty += d.qty;
                                        acc[k].itemNetTotal += d.itemNetTotal || 0;
                                        return acc;
                                      }, {})
                                    )
                                      .sort((a: any, b: any) => b.qty - a.qty)
                                      .map((r: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50/60">
                                          <td className="px-4 py-2 text-slate-600 font-medium">
                                            {r.name}
                                          </td>
                                          <td className="px-4 py-2 text-right font-bold text-blue-600">
                                            {formatNumber(r.qty)} {r.unit}
                                          </td>
                                          <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                                            {formatCurrency(r.itemNetTotal)}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
