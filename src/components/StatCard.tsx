/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  subtitle?: string;
  onDoubleClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  bgColorClass,
  subtitle,
  onDoubleClick
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onDoubleClick={onDoubleClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow select-none ${
        onDoubleClick ? 'cursor-pointer hover:border-indigo-200' : 'cursor-default'
      }`}
      id={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      title={onDoubleClick ? "💡 ดับเบิ้ลคลิกเพื่อดูรายละเอียดเชิงลึก (Double Click to Drill-Down)" : undefined}
    >
      <div className={`p-3.5 rounded-xl ${bgColorClass} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          {title}
          {onDoubleClick && (
            <span className="text-[9px] font-bold text-indigo-500 ml-1.5 bg-indigo-50 px-1 py-0.5 rounded-sm">DRILL-DOWN</span>
          )}
        </p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
