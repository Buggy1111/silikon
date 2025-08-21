import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = "",
  height = 300 
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
    className={`bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 p-8 ${className}`}
  >
    <div className="mb-8">
      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
      {subtitle && <p className="text-base text-gray-300 font-medium">{subtitle}</p>}
    </div>
    <div style={{ height: `${height}px` }}>
      {children}
    </div>
  </motion.div>
);

// Custom Tooltip komponenta
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl p-5 border border-white/20 rounded-2xl shadow-2xl"
      >
        <p className="font-black text-white mb-3 text-lg">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold mb-1" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {entry.name.includes('%') || entry.name.includes('efektivita') ? '%' : ''}
            {entry.name.includes('kg') || entry.name.includes('výroba') ? ' kg' : ''}
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Produkční efektivita - Area chart
interface ProductionEfficiencyProps {
  data: { month: string; efficiency: number; target: number }[];
}

export const ProductionEfficiencyChart: React.FC<ProductionEfficiencyProps> = ({ data }) => (
  <ChartContainer 
    title="Efektivita výroby" 
    subtitle="Porovnání skutečné vs. cílové efektivity"
    height={320}
  >
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
        <XAxis dataKey="month" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="efficiency"
          name="Skutečná efektivita"
          stroke="#3B82F6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#efficiencyGradient)"
        />
        <Area
          type="monotone"
          dataKey="target"
          name="Cílová efektivita"
          stroke="#10B981"
          strokeWidth={2}
          strokeDasharray="5 5"
          fillOpacity={1}
          fill="url(#targetGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Měsíční výroba - Bar chart
interface MonthlyProductionProps {
  data: { month: string; production: number; target: number; waste: number }[];
}

export const MonthlyProductionChart: React.FC<MonthlyProductionProps> = ({ data }) => (
  <ChartContainer 
    title="Měsíční výroba" 
    subtitle="Produkce, plán a odpady podle měsíců"
    height={350}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
        <XAxis dataKey="month" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="production" 
          name="Výroba (kg)" 
          fill="#8B5CF6" 
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        />
        <Bar 
          dataKey="target" 
          name="Plán (kg)" 
          fill="#F59E0B" 
          radius={[4, 4, 0, 0]}
          opacity={0.7}
          animationDuration={1200}
        />
        <Bar 
          dataKey="waste" 
          name="Odpad (kg)" 
          fill="#EF4444" 
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Trend výroby - Line chart
interface ProductionTrendProps {
  data: { date: string; production: number; efficiency: number }[];
}

export const ProductionTrendChart: React.FC<ProductionTrendProps> = ({ data }) => (
  <ChartContainer 
    title="Trend výroby" 
    subtitle="Denní produkce a efektivita"
    height={300}
  >
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis yAxisId="left" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="production"
          name="Výroba (kg)"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="efficiency"
          name="Efektivita (%)"
          stroke="#10B981"
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Distribuce materiálů - Pie chart
interface MaterialDistributionProps {
  data: { name: string; value: number; color: string }[];
}

export const MaterialDistributionChart: React.FC<MaterialDistributionProps> = ({ data }) => (
  <ChartContainer 
    title="Distribuce materiálů" 
    subtitle="Použití podle typů materiálů"
    height={400}
  >
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Stacked bar chart pro odpady
interface WasteAnalysisProps {
  data: { month: string; vulkanized: number; nonVulkanized: number; confection: number }[];
}

export const WasteAnalysisChart: React.FC<WasteAnalysisProps> = ({ data }) => (
  <ChartContainer 
    title="Analýza odpadů" 
    subtitle="Typy odpadů podle měsíců"
    height={320}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
        <XAxis dataKey="month" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="vulkanized" 
          name="Vulkanizovaný" 
          stackId="a" 
          fill="#EF4444"
          radius={[0, 0, 0, 0]}
        />
        <Bar 
          dataKey="nonVulkanized" 
          name="Nevulkanizovaný" 
          stackId="a" 
          fill="#F59E0B"
          radius={[0, 0, 0, 0]}
        />
        <Bar 
          dataKey="confection" 
          name="Konfekce" 
          stackId="a" 
          fill="#8B5CF6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// KPI Progress chart
interface KPIProgressProps {
  data: { name: string; current: number; target: number; unit: string }[];
}

export const KPIProgressChart: React.FC<KPIProgressProps> = ({ data }) => (
  <ChartContainer 
    title="KPI Plnění" 
    subtitle="Aktuální vs. cílové hodnoty"
    height={280}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="horizontal" data={data} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis type="number" stroke="#D1D5DB" fontSize={13} fontWeight={600} />
        <YAxis dataKey="name" type="category" stroke="#D1D5DB" fontSize={13} fontWeight={600} width={70} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="current" 
          name="Aktuální" 
          fill="#3B82F6"
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          dataKey="target" 
          name="Cíl" 
          fill="#10B981"
          opacity={0.6}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export default {
  ProductionEfficiencyChart,
  MonthlyProductionChart,
  ProductionTrendChart,
  MaterialDistributionChart,
  WasteAnalysisChart,
  KPIProgressChart,
};