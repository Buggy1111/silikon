import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/simpleStore';
import { 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  Star,
  Monitor,
  Download
} from 'lucide-react';
import { addDays, isBefore } from 'date-fns';
import ShareButton from './ShareButton';

// Import našich nových VMQ komponent
import {
  ProductionEfficiencyChart,
  MonthlyProductionChart,
  ProductionTrendChart,
  MaterialDistributionChart,
  WasteAnalysisChart,
  KPIProgressChart,
  InventoryTrendsChart,
} from './charts/VMQCharts';

import {
  KPIGrid,
  EfficiencyKPI,
  WasteKPI,
  ProductionKPI,
  InventoryKPI,
  CostKPI,
  TimeKPI,
  OperatorsKPI,
  QualityKPI,
  ProgressKPICard
} from './charts/ModernKPICards';
import RealDataLoader from './RealDataLoader';

const Dashboard: React.FC = () => {
  const {
    production,
    inventory,
    waste,
    materials,
    getProductionEfficiency,
    getWastePercentage,
    getInventoryTurnover,
    getMonthlyProduction,
    getTopMaterials
  } = useAppStore();


  // Vypočítané metriky
  const efficiency = getProductionEfficiency();
  const wastePercentage = getWastePercentage();
  const monthlyProduction = getMonthlyProduction();
  const topMaterials = getTopMaterials();
  const totalProduction = production.reduce((sum, p) => sum + p.totalProductionWeight, 0);
  const totalInventory = inventory.reduce((sum, i) => sum + i.quantity, 0);

  // Data pro grafy
  const efficiencyData = useMemo(() => {
    const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen'];
    return months.map(month => ({
      month,
      efficiency: month === 'Leden' ? efficiency : Math.random() * 20 + 75,
      target: 85
    }));
  }, [efficiency]);

  const monthlyProductionData = useMemo(() => {
    const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen'];
    return months.map((month, index) => {
      const prod = monthlyProduction.find(p => p.month === month);
      const fallbackValues = [1156, 1284, 1067, 1398, 1245, 1089];
      return {
        month,
        production: prod ? prod.total : fallbackValues[index],
        target: 1200,
        waste: Math.floor((prod ? prod.total : fallbackValues[index]) * 0.08)
      };
    });
  }, [monthlyProduction]);

  const wasteData = useMemo(() => [
    { type: 'Vulkanizovaný extruze', amount: 245, color: 'rgba(239, 68, 68, 0.8)' },
    { type: 'Nevulkanizovaný extruze', amount: 89, color: 'rgba(249, 115, 22, 0.8)' },
    { type: 'Vulkanizovaný konfekce', amount: 67, color: 'rgba(168, 85, 247, 0.8)' },
    { type: 'Nevulkanizovaný konfekce', amount: 23, color: 'rgba(34, 197, 94, 0.8)' }
  ], []);

  const materialUsageData = useMemo(() => 
    topMaterials.slice(0, 8).map(item => ({
      material: item.material,
      usage: item.usage
    }))
  , [topMaterials]);

  const inventoryStatusData = useMemo(() => {
    const now = new Date();
    const warningDate = addDays(now, 7);
    
    const ok = inventory.filter(item => !isBefore(item.expirationDate, warningDate)).length;
    const warning = inventory.filter(item => 
      isBefore(item.expirationDate, warningDate) && !isBefore(item.expirationDate, now)
    ).length;
    const expired = inventory.filter(item => isBefore(item.expirationDate, now)).length;

    return [
      { status: 'V pořádku', count: ok, color: 'rgba(34, 197, 94, 0.6)' },
      { status: 'Brzy expiruje', count: warning, color: 'rgba(249, 115, 22, 0.6)' },
      { status: 'Prošlé', count: expired, color: 'rgba(239, 68, 68, 0.6)' }
    ];
  }, [inventory]);

  // Simulované změny pro KPI
  const kpiChanges = {
    efficiency: { value: 5.2, type: 'increase' as const, period: 'za měsíc' },
    waste: { value: -3.1, type: 'decrease' as const, period: 'za měsíc' },
    production: { value: 12.4, type: 'increase' as const, period: 'za měsíc' },
    inventory: { value: -2.8, type: 'decrease' as const, period: 'za týden' }
  };

  // Připravím data pro grafy
  const chartData = useMemo(() => {
    // Efektivita data
    const efficiencyData = [
      { month: 'Leden', efficiency: efficiency, target: 85 },
      { month: 'Únor', efficiency: 88.5, target: 85 },
      { month: 'Březen', efficiency: 92.1, target: 85 },
      { month: 'Duben', efficiency: 89.7, target: 85 },
      { month: 'Květen', efficiency: 94.2, target: 85 },
      { month: 'Červen', efficiency: 91.8, target: 85 }
    ];

    // Měsíční výroba data
    const monthlyData = monthlyProduction.map((item, index) => ({
      month: item.month,
      production: item.total,
      target: 1200 + (index * 100),
      waste: Math.floor(item.total * 0.08)
    }));

    // Trend data - s fallback daty
    const trendData = production.length > 0 
      ? production.slice(-7).map((record, index) => ({
          date: `${index + 1}.7.`,
          production: record.totalProductionWeight,
          efficiency: (record.productWeightReal / Math.max(record.productWeightCalc, 1)) * 100
        }))
      : [
          { date: '1.7.', production: 580, efficiency: 88.5 },
          { date: '2.7.', production: 642, efficiency: 92.1 },
          { date: '3.7.', production: 598, efficiency: 89.7 },
          { date: '4.7.', production: 715, efficiency: 94.2 },
          { date: '5.7.', production: 683, efficiency: 91.8 },
          { date: '6.7.', production: 756, efficiency: 93.4 },
          { date: '7.7.', production: 629, efficiency: 90.2 }
        ];

    // Materiály data - s fallback daty
    const materialData = topMaterials.length > 0
      ? topMaterials.slice(0, 6).map((item, index) => ({
          name: item.material.length > 15 ? item.material.substring(0, 15) + '...' : item.material,
          value: item.usage,
          color: [
            '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
            '#EF4444', '#14B8A6', '#F97316', '#8B5F47'
          ][index]
        }))
      : [
          { name: '60ShA Plat. Transp.', value: 1250, color: '#3B82F6' },
          { name: '70ShA Perox. Black', value: 980, color: '#10B981' },
          { name: '80ShA Sulf. Red', value: 756, color: '#8B5CF6' },
          { name: '50ShA Plat. White', value: 642, color: '#F59E0B' },
          { name: '90ShA Perox. Blue', value: 584, color: '#EF4444' },
          { name: '85ShA Sulf. Green', value: 489, color: '#14B8A6' }
        ];

    // Odpady data
    const wasteData = [
      { month: 'Leden', vulkanized: 145, nonVulkanized: 32, confection: 18 },
      { month: 'Únor', vulkanized: 167, nonVulkanized: 28, confection: 24 },
      { month: 'Březen', vulkanized: 132, nonVulkanized: 35, confection: 15 },
      { month: 'Duben', vulkanized: 189, nonVulkanized: 41, confection: 29 },
      { month: 'Květen', vulkanized: 156, nonVulkanized: 38, confection: 22 },
      { month: 'Červen', vulkanized: 178, nonVulkanized: 33, confection: 27 }
    ];

    // KPI Progress data
    const kpiData = [
      { name: 'Efektivita', current: efficiency, target: 85, unit: '%' },
      { name: 'Výroba', current: totalProduction / 1000, target: 5, unit: 't' },
      { name: 'Kvalita', current: 96.8, target: 95, unit: '%' },
      { name: 'Čas', current: 8.2, target: 8, unit: 'h' }
    ];

    return { efficiencyData, monthlyData, trendData, materialData, wasteData, kpiData };
  }, [efficiency, monthlyProduction, production, topMaterials, totalProduction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 space-y-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),rgba(255,255,255,0))] pointer-events-none"/>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-500" />
      {/* Header with animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <motion.h1 
              className="text-7xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ textShadow: '0 4px 20px rgba(59, 130, 246, 0.15)' }}
            >
              VMQ Výroba
              <span className="block text-5xl font-light text-gray-600 mt-2">Řídicí Centrum</span>
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-xl font-medium tracking-wide"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Pokročilá Výrobní Inteligence & Analýzy v Reálném Čase
            </motion.p>
            
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -right-12 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 blur-sm"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -top-2 -right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-40"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>
          
          <motion.div 
            className="flex items-center space-x-4 mt-6 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center bg-white backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-semibold text-gray-700">
                {new Date().toLocaleDateString('cs-CZ', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-4 shadow-lg">
              <Zap className="w-5 h-5 mr-3 animate-pulse" />
              <span className="text-sm font-semibold">
                Živě {new Date().toLocaleTimeString('cs-CZ', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            <ShareButton />
          </motion.div>
        </div>
      </motion.div>

      {/* Real Data Loader */}
      <RealDataLoader />

      {/* Main KPI Cards */}
      <KPIGrid>
        <EfficiencyKPI value={efficiency} change={kpiChanges.efficiency} />
        <WasteKPI value={wastePercentage} change={kpiChanges.waste} />
        <ProductionKPI value={totalProduction} change={kpiChanges.production} />
        <InventoryKPI value={totalInventory} change={kpiChanges.inventory} />
      </KPIGrid>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CostKPI value={45.67} change={{ value: -2.3, type: 'decrease', period: 'za měsíc' }} />
        <TimeKPI value={8.2} change={{ value: -5.1, type: 'decrease', period: 'za týden' }} />
        <OperatorsKPI value={8} change={{ value: 14.3, type: 'increase', period: 'za měsíc' }} />
        <QualityKPI value={96.8} change={{ value: 2.1, type: 'increase', period: 'za týden' }} />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProgressKPICard 
          title="Plnění výrobního plánu" 
          current={totalProduction} 
          target={5000} 
          unit="kg" 
          icon={Target}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <ProgressKPICard 
          title="Efektivita týmu" 
          current={87} 
          target={90} 
          unit="%" 
          icon={Users}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <ProgressKPICard 
          title="Kvalitní výroba" 
          current={967} 
          target={1000} 
          unit="ks" 
          icon={Star}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      {/* Main Charts - Větší a lépe rozmístěné */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <ProductionEfficiencyChart data={chartData.efficiencyData} />
        <MonthlyProductionChart data={chartData.monthlyData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <ProductionTrendChart data={chartData.trendData} />
        <KPIProgressChart data={chartData.kpiData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <MaterialDistributionChart data={chartData.materialData} />
        <WasteAnalysisChart data={chartData.wasteData} />
      </div>

      {/* Inventory chart samostatně pro lepší viditelnost */}
      <div className="grid grid-cols-1 gap-10">
        <div className="max-w-4xl mx-auto w-full">
          <InventoryTrendsChart data={inventoryStatusData} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-500" />
              Poslední Výrobní Aktivita
            </h3>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Posledních 5 záznamů</span>
          </div>
          
          <div className="space-y-3">
            {production.slice(-5).map((record, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {record.operator.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-800 mb-1">
                    {record.materialName}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-blue-500/20 px-2 py-1 rounded-lg">{record.totalProductionWeight.toFixed(1)} kg</span>
                    <span>•</span>
                    <span>{record.operator}</span>
                    <span>•</span>
                    <span>{record.actualTime.toFixed(1)}h</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {record.date.toLocaleDateString('cs-CZ')}
                  </p>
                  <div className="flex items-center justify-end">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400 font-bold bg-green-500/20 px-2 py-1 rounded-lg">+12%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200"
        >
          <h3 className="text-2xl font-bold mb-8 flex items-center text-gray-800">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
            Rychlé Akce
          </h3>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-100 rounded-2xl p-5 text-left hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-800">Export Dat</span>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Stáhnout kompletní Excel report</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-100 rounded-2xl p-5 text-left hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-800">Nový Záznam</span>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Přidat nový výrobní záznam</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-100 rounded-2xl p-5 text-left hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-800">Analýzy</span>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Pokročilé výkonnostní reporty</p>
            </motion.button>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;