// Widget Data Provider - Poskytuje data pro Web App Widgets
import { useAppStore } from '../stores/simpleStore';

export interface VMQWidgetData {
  dailyProduction: number;
  productionChange: number;
  efficiency: number;
  efficiencyChange: number;
  inventoryLevel: number;
  inventoryChange: number;
  wasteLevel: number;
  wasteChange: number;
  lastUpdate: Date;
}

export interface VMQProductionWidgetData {
  currentRate: number;
  rateTrend: 'up' | 'down' | 'stable';
  efficiency: number;
  activeLines: string;
  uptime: string;
  quality: number;
  machineStatus: 'active' | 'warning' | 'error';
  timestamp: Date;
}

// Generate widget data from store
export function generateWidgetData(): VMQWidgetData {
  const { production, materials, waste } = useAppStore.getState();
  
  // Calculate daily production
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayProduction = production.filter(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });
  
  const dailyProduction = todayProduction.reduce((sum, record) => sum + record.productWeightReal, 0);
  
  // Calculate efficiency
  const totalCalculated = todayProduction.reduce((sum, record) => sum + record.productWeightCalc, 0);
  const efficiency = totalCalculated > 0 ? (dailyProduction / totalCalculated) * 100 : 0;
  
  // Calculate inventory level (simplified)
  const inventoryLevel = Math.floor(70 + Math.random() * 30); // Placeholder calculation
  
  // Calculate waste level
  const totalWaste = waste.reduce((sum, record) => sum + record.weight, 0);
  const wasteLevel = dailyProduction > 0 ? (totalWaste / (dailyProduction + totalWaste)) * 100 : 0;
  
  return {
    dailyProduction: Math.round(dailyProduction),
    productionChange: Math.random() > 0.5 ? Math.round(Math.random() * 20) : -Math.round(Math.random() * 10),
    efficiency: Math.round(efficiency * 10) / 10,
    efficiencyChange: Math.random() > 0.5 ? Math.round(Math.random() * 50) / 10 : -Math.round(Math.random() * 30) / 10,
    inventoryLevel: Math.round(inventoryLevel),
    inventoryChange: Math.random() > 0.5 ? -Math.round(Math.random() * 10) : Math.round(Math.random() * 5),
    wasteLevel: Math.round(wasteLevel * 10) / 10,
    wasteChange: Math.random() > 0.5 ? -Math.round(Math.random() * 10) / 10 : Math.round(Math.random() * 5) / 10,
    lastUpdate: new Date()
  };
}

// Generate production widget data
export function generateProductionWidgetData(): VMQProductionWidgetData {
  const { production } = useAppStore.getState();
  
  // Calculate current production rate (last hour simulation)
  const currentRate = Math.floor(250 + Math.random() * 100); // kg/h
  
  // Determine trend based on recent data
  const rateTrend: 'up' | 'down' | 'stable' = 
    Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';
  
  // Calculate efficiency from recent production
  const recentProduction = production.slice(-10);
  let efficiency = 85;
  if (recentProduction.length > 0) {
    const totalReal = recentProduction.reduce((sum, r) => sum + r.productWeightReal, 0);
    const totalCalc = recentProduction.reduce((sum, r) => sum + r.productWeightCalc, 0);
    efficiency = totalCalc > 0 ? (totalReal / totalCalc) * 100 : 85;
  }
  
  // Generate other metrics
  const activeLines = '3/3'; // Assume all lines active
  const uptime = `${Math.floor(16 + Math.random() * 4)}.${Math.floor(Math.random() * 9)}h`;
  const quality = 97 + Math.random() * 3;
  
  // Determine machine status
  const machineStatus: 'active' | 'warning' | 'error' = 
    Math.random() > 0.1 ? 'active' : Math.random() > 0.05 ? 'warning' : 'error';
  
  return {
    currentRate,
    rateTrend,
    efficiency: Math.round(efficiency * 10) / 10,
    activeLines,
    uptime,
    quality: Math.round(quality * 10) / 10,
    machineStatus,
    timestamp: new Date()
  };
}

// Widget data API endpoints (for use in widgets)
export const WidgetAPI = {
  // Dashboard widget data endpoint
  getDashboardData: (): VMQWidgetData => {
    try {
      return generateWidgetData();
    } catch (error) {
      console.error('[Widget API] Dashboard data error:', error);
      return {
        dailyProduction: 0,
        productionChange: 0,
        efficiency: 0,
        efficiencyChange: 0,
        inventoryLevel: 0,
        inventoryChange: 0,
        wasteLevel: 0,
        wasteChange: 0,
        lastUpdate: new Date()
      };
    }
  },

  // Production widget data endpoint
  getProductionData: (): VMQProductionWidgetData => {
    try {
      return generateProductionWidgetData();
    } catch (error) {
      console.error('[Widget API] Production data error:', error);
      return {
        currentRate: 0,
        rateTrend: 'stable',
        efficiency: 0,
        activeLines: '0/3',
        uptime: '0.0h',
        quality: 0,
        machineStatus: 'error',
        timestamp: new Date()
      };
    }
  }
};

// Global widget API for use in widget templates
if (typeof window !== 'undefined') {
  (window as any).VMQWidgetAPI = WidgetAPI;
}