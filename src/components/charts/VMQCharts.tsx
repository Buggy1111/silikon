// VMQ Charts - Specialized chart components for VMQ production application
// Integrates UniversalCharts with VMQ data structures and styling

import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import UniversalCharts, { CHART_TYPES } from './UniversalCharts';

// VMQ Color Palette - Blues, Indigos, and complementary colors
export const VMQ_COLORS = {
  primary: ['#3B82F6', '#1E40AF', '#1D4ED8', '#2563EB'], // Blues
  secondary: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3'], // Indigos
  accent: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'], // Purples
  success: ['#10B981', '#059669', '#047857', '#065F46'], // Greens
  warning: ['#F59E0B', '#D97706', '#B45309', '#92400E'], // Ambers
  danger: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'], // Reds
  neutral: ['#6B7280', '#4B5563', '#374151', '#1F2937'], // Grays
};

// Czech number formatter for VMQ
const vmqFormatter = (value: number, unit: string = ''): string => {
  const formatted = new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: unit === '%' ? 1 : 0,
  }).format(value);
  return `${formatted}${unit}`;
};

// Chart container with VMQ styling
interface VMQChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
}

const VMQChartContainer: React.FC<VMQChartContainerProps> = memo(({ 
  title, 
  subtitle, 
  children, 
  className = "",
  height = 400 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ 
      scale: 1.01,
      y: -2,
      transition: { duration: 0.3 }
    }}
    className={`bg-white rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 ${className}`}
  >
    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">{title}</h3>
        {subtitle && <p className="text-base text-gray-600 font-medium">{subtitle}</p>}
      </div>
      <div style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  </motion.div>
));

VMQChartContainer.displayName = 'VMQChartContainer';

// Production Efficiency Chart - Area chart converted to UniversalCharts format
interface ProductionEfficiencyProps {
  data: { month: string; efficiency: number; target: number }[];
}

export const ProductionEfficiencyChart: React.FC<ProductionEfficiencyProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.month,
      value: item.efficiency,
      color: VMQ_COLORS.primary[index % VMQ_COLORS.primary.length],
      icon: '📊',
      target: item.target
    }));
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, '%');

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={formatter}
      title="Efektivita výroby"
      subtitle="Porovnání skutečné vs. cílové efektivity"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

ProductionEfficiencyChart.displayName = 'ProductionEfficiencyChart';

// Monthly Production Chart - Bar chart with multiple series
interface MonthlyProductionProps {
  data: { month: string; production: number; target: number; waste: number }[];
}

export const MonthlyProductionChart: React.FC<MonthlyProductionProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  
  const chartData = useMemo(() => {
    // If no data, provide fallback data
    const workingData = data.length > 0 ? data : [
      { month: 'Leden', production: 1156, target: 1200, waste: 92 },
      { month: 'Únor', production: 1284, target: 1300, waste: 103 },
      { month: 'Březen', production: 1067, target: 1400, waste: 85 },
      { month: 'Duben', production: 1398, target: 1500, waste: 112 },
      { month: 'Květen', production: 1245, target: 1600, waste: 99 },
      { month: 'Červen', production: 1089, target: 1700, waste: 87 }
    ];
    
    return workingData.map((item, index) => ({
      name: item.month,
      value: item.production,
      color: VMQ_COLORS.secondary[index % VMQ_COLORS.secondary.length],
      icon: '🏭',
      production: item.production,
      target: item.target,
      waste: item.waste
    }));
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, ' kg');

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={formatter}
      title="Měsíční výroba"
      subtitle="Produkce, plán a odpady podle měsíců"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

MonthlyProductionChart.displayName = 'MonthlyProductionChart';

// Production Trend Chart - Line chart equivalent
interface ProductionTrendProps {
  data: { date: string; production: number; efficiency: number }[];
}

export const ProductionTrendChart: React.FC<ProductionTrendProps> = memo(({ data }) => {
  const chartData = useMemo(() => {
    // If no data, provide fallback data
    const workingData = data.length > 0 ? data : [
      { date: '1.7.', production: 580, efficiency: 88.5 },
      { date: '2.7.', production: 642, efficiency: 92.1 },
      { date: '3.7.', production: 598, efficiency: 89.7 },
      { date: '4.7.', production: 715, efficiency: 94.2 },
      { date: '5.7.', production: 683, efficiency: 91.8 },
      { date: '6.7.', production: 756, efficiency: 93.4 },
      { date: '7.7.', production: 629, efficiency: 90.2 }
    ];
    
    return workingData.map((item, index) => ({
      name: item.date,
      value: item.production,
      color: VMQ_COLORS.primary[index % VMQ_COLORS.primary.length],
      icon: '📈',
      efficiency: item.efficiency
    }));
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, ' kg');

  return (
    <UniversalCharts
      data={chartData}
      chartType={CHART_TYPES.BAR}
      formatter={formatter}
      title="Trend výroby"
      subtitle="Denní produkce a efektivita"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

ProductionTrendChart.displayName = 'ProductionTrendChart';

// Material Distribution Chart - Pie chart for material usage
interface MaterialDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export const MaterialDistributionChart: React.FC<MaterialDistributionProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.PIE);
  
  const chartData = useMemo(() => {
    // If no data, provide fallback data
    const workingData = data.length > 0 ? data : [
      { name: '60ShA Plat. Transp.', value: 1250, color: '#3B82F6' },
      { name: '70ShA Perox. Black', value: 980, color: '#10B981' },
      { name: '80ShA Sulf. Red', value: 756, color: '#8B5CF6' },
      { name: '50ShA Plat. White', value: 642, color: '#F59E0B' },
      { name: '90ShA Perox. Blue', value: 584, color: '#EF4444' },
      { name: '85ShA Sulf. Green', value: 489, color: '#14B8A6' }
    ];
    
    return workingData.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: item.color || VMQ_COLORS.accent[index % VMQ_COLORS.accent.length],
      icon: '🧱',
    }));
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, ' kg');

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={formatter}
      title="Distribuce materiálů"
      subtitle="Použití podle typů materiálů"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

MaterialDistributionChart.displayName = 'MaterialDistributionChart';

// Waste Analysis Chart - Stacked bar equivalent
interface WasteAnalysisProps {
  data: { month: string; vulkanized: number; nonVulkanized: number; confection: number }[];
}

export const WasteAnalysisChart: React.FC<WasteAnalysisProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.PIE);
  
  const chartData = useMemo(() => {
    // If no data, provide fallback data
    const workingData = data.length > 0 ? data : [
      { month: 'Leden', vulkanized: 145, nonVulkanized: 32, confection: 18 },
      { month: 'Únor', vulkanized: 167, nonVulkanized: 28, confection: 24 },
      { month: 'Březen', vulkanized: 132, nonVulkanized: 35, confection: 15 },
      { month: 'Duben', vulkanized: 189, nonVulkanized: 41, confection: 29 },
      { month: 'Květen', vulkanized: 156, nonVulkanized: 38, confection: 22 },
      { month: 'Červen', vulkanized: 178, nonVulkanized: 33, confection: 27 }
    ];
    
    // Flatten the data to show different waste types across months
    const flatData: Array<{ name: string; value: number; color: string; icon: string }> = [];
    
    workingData.forEach((monthData, monthIndex) => {
      flatData.push(
        {
          name: `${monthData.month} - Vulk.`,
          value: monthData.vulkanized,
          color: VMQ_COLORS.danger[0],
          icon: '🔥',
        },
        {
          name: `${monthData.month} - Nevulk.`,
          value: monthData.nonVulkanized,
          color: VMQ_COLORS.warning[0],
          icon: '⚡',
        },
        {
          name: `${monthData.month} - Konf.`,
          value: monthData.confection,
          color: VMQ_COLORS.accent[0],
          icon: '📦',
        }
      );
    });

    return flatData;
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, ' kg');

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={formatter}
      title="Analýza odpadů"
      subtitle="Typy odpadů podle měsíců"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

WasteAnalysisChart.displayName = 'WasteAnalysisChart';

// KPI Progress Chart - Horizontal bar equivalent
interface KPIProgressProps {
  data: { name: string; current: number; target: number; unit: string }[];
}

export const KPIProgressChart: React.FC<KPIProgressProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.RADAR);
  
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.name,
      value: item.current,
      color: VMQ_COLORS.success[index % VMQ_COLORS.success.length],
      icon: '🎯',
      current: item.current,
      target: item.target,
      unit: item.unit,
      progress: (item.current / item.target) * 100
    }));
  }, [data]);

  const formatter = (value: number, item?: any) => {
    const unit = item?.unit || '';
    return vmqFormatter(value, unit);
  };

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={(value) => formatter(value)}
      title="KPI Plnění"
      subtitle="Aktuální vs. cílové hodnoty"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={580}
      className=""
    />
  );
});

KPIProgressChart.displayName = 'KPIProgressChart';

// Inventory Trends Chart - New chart for inventory analysis
interface InventoryTrendsProps {
  data: { status: string; count: number; color: string }[];
}

export const InventoryTrendsChart: React.FC<InventoryTrendsProps> = memo(({ data }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.PIE);
  
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.status,
      value: item.count,
      color: item.color,
      icon: getInventoryIcon(item.status),
    }));
  }, [data]);

  const formatter = (value: number) => vmqFormatter(value, ' ks');

  return (
    <UniversalCharts
      data={chartData}
      chartType={chartType}
      onChartTypeChange={setChartType}
      formatter={formatter}
      title="Stav zásob"
      subtitle="Inventory podle expirace"
      showSelector={true}
      selectorLabels={{
        pie: 'Koláč',
        bar: 'Sloupce',
        radar: 'Radar'
      }}
      height={500}
      className=""
    />
  );
});

InventoryTrendsChart.displayName = 'InventoryTrendsChart';

// Helper function to get inventory status icons
function getInventoryIcon(status: string): string {
  switch (status) {
    case 'V pořádku':
      return '✅';
    case 'Brzy expiruje':
      return '⚠️';
    case 'Prošlé':
      return '❌';
    default:
      return '📦';
  }
}

// Export all chart components
export {
  VMQChartContainer,
  vmqFormatter,
};

// Default export with all chart components
export default {
  ProductionEfficiencyChart,
  MonthlyProductionChart,
  ProductionTrendChart,
  MaterialDistributionChart,
  WasteAnalysisChart,
  KPIProgressChart,
  InventoryTrendsChart,
};