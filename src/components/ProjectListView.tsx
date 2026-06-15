/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, MapPin, Trash2, Calendar, User, UserCheck, CreditCard, ChevronRight } from 'lucide-react';
import { Project } from '../types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

interface ProjectListViewProps {
  projects: Project[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSelectProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectListView({
  projects,
  searchTerm,
  setSearchTerm,
  onSelectProject,
  onDeleteProject
}: ProjectListViewProps) {
  const filtered = React.useMemo(() => {
    const query = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.quotation_no.toLowerCase().includes(query) ||
        p.customerName.toLowerCase().includes(query) ||
        (p.province && p.province.toLowerCase().includes(query))
    );
  }, [projects, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">ทำเนียบโครงการทั้งหมดในระบบ</h2>
          <p className="text-xs text-slate-400 mt-1">
            ค้นหา ตรวจสอบ ยอดและพารามิเตอร์การสั่งตัดของแต่ละโครงการ
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่, ชื่อลูกค้า, หรือจังหวัด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  เลขใบแจ้งงาน (Quotation No)
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  เจ้าของบ้าน / ชื่อลูกค้า
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  พนักงานดูแลการขาย
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  มูลค่าสุทธิ (Net Total)
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  การทําลายข้อมูล
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectProject(p)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectProject(p)}
                      className="text-[13px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 focus:outline-none"
                    >
                      {p.quotation_no}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </button>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-slate-300" /> อนุมัติ: {p.confirm_date || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {p.customerName || 'ไม่พบนามลูกค้า'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-red-400" /> จ. {p.province || 'ไม่ระบุจังหวัด'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {p.sale_id.split('(')[0].trim() || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-[14px] font-black text-slate-800 flex items-center justify-end gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-300" />
                      {formatCurrency(p.netTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteProject(p.id)}
                      className="p-2 text-slate-350 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all cursor-pointer inline-flex"
                      title="ลบข้อมูลโครงการ"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-400 font-medium text-xs"
                  >
                    ไม่มีรายการโครงการตามคำค้นหาดังกล่าว
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
