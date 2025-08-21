export interface Material {
  id: string;
  name: string;
  supplier: string;
  status: 'Testovací' | 'Výroba' | 'Vývoj' | 'Archiv' | 'Aktivní' | '-';
}

export interface ProductionRecord {
  id: string;
  recordNumber: string;
  articleNumber: string;
  dimensions: string;
  date: Date;
  materialId: string;
  materialName: string;
  supplierCode: string;
  lotNumber: string;
  customer: string;
  month: string;
  supervisor: string;
  operator: string;
  productionQuantity: number;
  lineSpeedReal: number;
  lineSpeedCalc: number;
  lineSpeedRealPerHour: number;
  lineSpeedCalcPerHour: number;
  productWeightReal: number;
  productWeightCalc: number;
  wasteVulcanized: number;
  wasteVulcanizedCalc: number;
  wasteVulcanizedPercentage: number;
  wasteNonVulcanized: number;
  wasteNonVulcanizedCalc: number;
  wasteNonVulcanizedPercentage: number;
  totalWaste: number;
  totalWasteCalc: number;
  totalWastePercentage: number;
  totalProductionWeight: number;
  totalProductionWeightReal: number;
  totalWeight: number;
  startTime: Date;
  endTime: Date;
  actualTime: number;
  calculatedTime: number;
  actualTimeDisplay: string;
  performanceEvalKg: number;
  performanceEvalTime: number;
  notes: string;
}

export interface DevelopmentRecord {
  id: string;
  recordNumber: string;
  articleNumber?: string;
  dimensions?: string;
  hubiceNumber?: string;
  date: Date;
  materialId: string;
  materialName: string;
  supplierCode: string;
  lotNumber: string;
  customer?: string;
  month: string;
  supervisor: string;
  operator: string;
  productionQuantity: number;
  lineSpeedReal: number;
  lineSpeedCalc: number;
  lineSpeedRealPerHour: number;
  lineSpeedCalcPerHour: number;
  productWeightReal: number;
  productWeightCalc: number;
  wasteVulcanized: number;
  wasteNonVulcanized: number;
  totalDevelopmentWeight: number;
  startTime: Date;
  endTime: Date;
  realTime: number;
  calcTime: number;
  totalTime: number;
  notes?: string;
}

export interface InventoryRecord {
  id: string;
  recordNumber: string;
  mixtureType: 'Extrůzní' | 'Lisovací';
  materialId: string;
  materialName: string;
  supplierCode: string;
  lotNumber: string;
  storageMonth: string;
  productionDate: Date;
  expirationDate: Date;
  storageDate: Date;
  quantity: number;
  storedBy: string;
  extensionDate?: Date;
  writtenOff: number;
  writtenOffBy?: string;
  writeOffReason?: string;
  notes?: string;
  isArchived?: boolean;
  archivedDate?: Date;
  archivedBy?: string;
  archiveReason?: string;
}

export interface WasteRecord {
  id: string;
  recordNumber: number;
  exportDate: Date;
  month: string;
  wasteType: 'Vulkanizovaný extruze' | 'Nevulkanizovaný extruze' | 'Vulkanizovaný konfekce' | 'Nevulkanizovaný konfekce';
  weight: number;
  recordedBy: string;
  notes?: string;
}

export interface ProductionAnalysis {
  month: string;
  totalProductsWeightCalc: number;
  totalProductsWeightReal: number;
  productWeightDifference: number;
  totalWasteWeightCalc: number;
  totalWasteWeightReal: number;
  wasteWeightDifference: number;
  realTime: string;
  calculatedTime: string;
  weightEfficiencyPercent: number;
  timeEfficiencyPercent: number;
}

export interface InventoryAnalysis {
  month: string;
  extrusionMixturesStored: number;
  pressingMixturesStored: number;
  writtenOff: number;
}

export interface WasteAnalysis {
  month: string;
  nonVulcanizedExtrusion: number;
  vulcanizedExtrusion: number;
  nonVulcanizedExpired: number;
  nonVulcanizedConfection: number;
  vulcanizedConfection: number;
  total: number;
}

export interface RequirementRecord {
  id: string;
  recordNumber: number;
  entryDate: Date;
  year: number;
  requirement: string;
  enteredBy: string;
  completionPercent: number;
  notes?: string;
}

export interface ExcelImportData {
  materials: Material[];
  production: ProductionRecord[];
  development: DevelopmentRecord[];
  inventory: InventoryRecord[];
  waste: WasteRecord[];
  requirements: RequirementRecord[];
  productionAnalysis: ProductionAnalysis[];
  inventoryAnalysis: InventoryAnalysis[];
  wasteAnalysis: WasteAnalysis[];
}

export type ViewType = 'dashboard' | 'production' | 'development' | 'inventory' | 'waste' | 'requirements' | 'analytics';

export interface User {
  username: string;
  isAuthenticated: boolean;
  role: 'admin';
}