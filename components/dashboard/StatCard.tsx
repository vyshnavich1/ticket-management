'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number;
  color: 'indigo' | 'blue' | 'orange' | 'gray';
  icon: React.ReactNode;
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  gray: 'bg-gray-50 text-gray-600 border-gray-100',
};

const iconBg = {
  indigo: 'bg-indigo-100 text-indigo-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  gray: 'bg-gray-200 text-gray-600',
};

export default function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg[color]}`}>{icon}</div>
      </div>
    </motion.div>
  );
}
