import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: string;
  icon: LucideIcon | React.ReactNode;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive',
  trend,
  icon,
  color = 'indigo',
}) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 text-purple-500 border-purple-500/20',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-500 border-rose-500/20',
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-500 border-indigo-500/20',
  };

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-6 h-6" />;
    }
    return null;
  };

  const footerText = change || trend;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-3.5 rounded-xl bg-gradient-to-br border ${colorMap[color]} shadow-inner`}
        >
          {renderIcon()}
        </div>
      </div>
      {footerText && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-500 dark:text-slate-400">
          <span className={`font-semibold mr-1.5 ${changeType === 'negative' ? 'text-rose-500' : 'text-emerald-500'}`}>
            {footerText}
          </span>
        </div>
      )}
    </motion.div>
  );
};
