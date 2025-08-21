import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Package, 
  Activity,
  BarChart3,
  DollarSign,
  Clock,
  Users,
  Award,
  Zap
} from 'lucide-react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1500, decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (value - startValue) * easeOut;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value, duration]);

  return <span>{displayValue.toFixed(decimals)}</span>;
};

interface ModernKPICardProps {
  title: string;
  value: number;
  unit?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ElementType;
  gradient: string;
  textColor?: string;
  decimals?: number;
}

export const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  unit = '',
  change,
  icon: Icon,
  gradient,
  textColor = 'text-white',
  decimals = 1
}) => {
  // Override textColor for better readability
  const actualTextColor = 'text-white';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.03,
        y: -4,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`relative overflow-hidden rounded-3xl ${gradient} p-8 shadow-xl hover:shadow-2xl transition-all duration-500`}
    >
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-2xl bg-white/40 backdrop-blur-md shadow-lg`}>
            <Icon className={`w-8 h-8 ${actualTextColor} drop-shadow-lg`} />
          </div>
          
          {change && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center text-sm font-medium ${actualTextColor}`}
            >
              {change.type === 'increase' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
            </motion.div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className={`text-base font-bold ${actualTextColor} opacity-90 tracking-wide mb-2`}>
            {title}
          </h3>
          <div className={`text-4xl font-black ${actualTextColor} tracking-tight leading-none`}>
            <AnimatedCounter value={value} decimals={decimals} />
            <span className="text-2xl ml-2 font-light opacity-90">{unit}</span>
          </div>
          {change && (
            <p className={`text-xs ${actualTextColor} opacity-75`}>
              {change.period}
            </p>
          )}
        </div>
      </div>
      
      {/* Enhanced Shine Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform"
        initial={{ x: '-150%' }}
        animate={{ x: '150%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

interface ProgressKPICardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

export const ProgressKPICard: React.FC<ProgressKPICardProps> = ({
  title,
  current,
  target,
  unit,
  icon: Icon,
  color
}) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.3 }
      }}
      className="bg-white rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-2 tracking-wide">{title}</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              <AnimatedCounter value={current} />
            </span>
            <span className="text-lg text-gray-600 font-medium">/ {target.toLocaleString()} {unit}</span>
          </div>
        </div>
        
        <div className={`p-4 rounded-2xl ${color} shadow-lg border border-white/30`}>
          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600 tracking-wide">PROGRESS</span>
          <span className={`text-lg font-black ${
            percentage >= 100 ? 'text-green-400' : 
            percentage >= 80 ? 'text-blue-400' : 'text-gray-400'
          }`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
          <motion.div
            className={`h-full ${color} rounded-full shadow-inner`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Enhanced progress bar shine */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
};

// Predefined KPI cards
export const EfficiencyKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Efektivita výroby"
    value={value}
    unit="%"
    change={change}
    icon={Target}
    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
  />
);

export const WasteKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Podíl odpadu"
    value={value}
    unit="%"
    change={change}
    icon={AlertTriangle}
    gradient="bg-gradient-to-br from-red-500 to-red-600"
  />
);

export const ProductionKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Celková výroba"
    value={value / 1000}
    unit="t"
    change={change}
    icon={Activity}
    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
    decimals={1}
  />
);

export const InventoryKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Skladové zásoby"
    value={value / 1000}
    unit="t"
    change={change}
    icon={Package}
    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
    decimals={1}
  />
);

export const CostKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Náklady na kg"
    value={value}
    unit="Kč"
    change={change}
    icon={DollarSign}
    gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
    decimals={2}
  />
);

export const TimeKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Průměrný čas"
    value={value}
    unit="h"
    change={change}
    icon={Clock}
    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
    decimals={1}
  />
);

export const OperatorsKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Aktivní operátoři"
    value={value}
    unit=""
    change={change}
    icon={Users}
    gradient="bg-gradient-to-br from-teal-500 to-teal-600"
    decimals={0}
  />
);

export const QualityKPI: React.FC<{ value: number; change?: any }> = ({ value, change }) => (
  <ModernKPICard
    title="Kvalita výroby"
    value={value}
    unit="%"
    change={change}
    icon={Award}
    gradient="bg-gradient-to-br from-pink-500 to-pink-600"
    decimals={1}
  />
);

// Grid container
export const KPIGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ 
  children, 
  columns = 4 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6 mb-8`}>
    {children}
  </div>
);