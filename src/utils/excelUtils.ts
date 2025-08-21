import * as XLSX from 'xlsx';
import { 
  Material, 
  ProductionRecord, 
  DevelopmentRecord, 
  InventoryRecord, 
  WasteRecord, 
  ExcelImportData,
  RequirementRecord,
  ProductionAnalysis,
  InventoryAnalysis,
  WasteAnalysis
} from '../types';

export const parseExcelFile = (file: File): Promise<ExcelImportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const result: ExcelImportData = {
          materials: [],
          production: [],
          development: [],
          inventory: [],
          waste: [],
          requirements: [],
          productionAnalysis: [],
          inventoryAnalysis: [],
          wasteAnalysis: []
        };

        // Parse materials from M_Data sheet
        if (workbook.SheetNames.includes('M_Data')) {
          const worksheet = workbook.Sheets['M_Data'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.materials = parseMaterialsData(rawData);
        }

        // Parse production data from Extruze sheet
        if (workbook.SheetNames.includes('Extruze')) {
          const worksheet = workbook.Sheets['Extruze'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.production = parseProductionData(rawData);
        }

        // Parse development data from Vývoje sheet
        if (workbook.SheetNames.includes('Vývoje')) {
          const worksheet = workbook.Sheets['Vývoje'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.development = parseDevelopmentData(rawData);
        }

        // Parse inventory data from VMQ sklad směsí sheet
        if (workbook.SheetNames.includes('VMQ sklad směsí')) {
          const worksheet = workbook.Sheets['VMQ sklad směsí'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.inventory = parseInventoryData(rawData);
        }

        // Parse waste data from Zápis odpadů sheet
        if (workbook.SheetNames.includes('Zápis odpadů')) {
          const worksheet = workbook.Sheets['Zápis odpadů'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.waste = parseWasteData(rawData);
        }

        // Parse requirements from Zápis požadavků VMQ linky sheet
        if (workbook.SheetNames.includes('Zápis požadavků VMQ linky')) {
          const worksheet = workbook.Sheets['Zápis požadavků VMQ linky'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.requirements = parseRequirementsData(rawData);
        }

        // Parse analysis data
        if (workbook.SheetNames.includes('Analýza ztrát výroba')) {
          const worksheet = workbook.Sheets['Analýza ztrát výroba'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.productionAnalysis = parseProductionAnalysisData(rawData);
        }

        if (workbook.SheetNames.includes('Analýza VMQ skladu směsí')) {
          const worksheet = workbook.Sheets['Analýza VMQ skladu směsí'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.inventoryAnalysis = parseInventoryAnalysisData(rawData);
        }

        if (workbook.SheetNames.includes('Analýza odpadů')) {
          const worksheet = workbook.Sheets['Analýza odpadů'];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          result.wasteAnalysis = parseWasteAnalysisData(rawData);
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

const parseMaterialsData = (rawData: any[]): Material[] => {
  const materials: Material[] = [];
  
  // Skip header row and process data
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[1] && row[1] !== '-' && row[1] !== '------') {
      materials.push({
        id: `mat_${i}`,
        name: row[1] || '',
        supplier: row[0] || '',
        status: row[7] || '-'
      });
    }
  }
  
  return materials;
};

const parseProductionData = (rawData: any[]): ProductionRecord[] => {
  const production: ProductionRecord[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'P. č.') {
      production.push({
        id: `prod_${i}`,
        recordNumber: row[0] || '',
        articleNumber: row[1] || '',
        dimensions: row[2] || '',
        date: parseExcelDate(row[3]),
        materialId: `mat_${row[4]}`,
        materialName: row[4] || '',
        supplierCode: row[5] || '',
        lotNumber: row[6] || '',
        customer: row[7] || '',
        month: row[8] || '',
        supervisor: row[9] || '',
        operator: row[10] || '',
        productionQuantity: parseFloat(row[12]) || 0,
        lineSpeedReal: parseFloat(row[13]) || 0,
        lineSpeedCalc: parseFloat(row[14]) || 0,
        lineSpeedRealPerHour: parseFloat(row[15]) || 0,
        lineSpeedCalcPerHour: parseFloat(row[16]) || 0,
        productWeightReal: parseFloat(row[17]) || 0,
        productWeightCalc: parseFloat(row[18]) || 0,
        wasteVulcanized: parseFloat(row[19]) || 0,
        wasteVulcanizedCalc: parseFloat(row[20]) || 0,
        wasteVulcanizedPercentage: parseFloat(row[21]) || 0,
        wasteNonVulcanized: parseFloat(row[22]) || 0,
        wasteNonVulcanizedCalc: parseFloat(row[23]) || 0,
        wasteNonVulcanizedPercentage: parseFloat(row[24]) || 0,
        totalWaste: parseFloat(row[25]) || 0,
        totalWasteCalc: parseFloat(row[26]) || 0,
        totalWastePercentage: parseFloat(row[27]) || 0,
        totalProductionWeight: parseFloat(row[32]) || 0,
        totalProductionWeightReal: parseFloat(row[33]) || 0,
        totalWeight: parseFloat(row[33]) || 0,
        startTime: parseExcelTime(row[34]),
        endTime: parseExcelTime(row[35]),
        actualTime: parseFloat(row[37]) || 0,
        calculatedTime: parseFloat(row[38]) || 0,
        actualTimeDisplay: row[36] || '',
        performanceEvalKg: parseFloat(row[41]) || 0,
        performanceEvalTime: parseFloat(row[42]) || 0,
        notes: row[44] || ''
      });
    }
  }
  
  return production;
};

const parseDevelopmentData = (rawData: any[]): DevelopmentRecord[] => {
  const development: DevelopmentRecord[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'P. č.') {
      development.push({
        id: `dev_${i}`,
        recordNumber: row[0] || '',
        articleNumber: row[1],
        dimensions: row[2],
        hubiceNumber: row[3],
        date: parseExcelDate(row[4]),
        materialId: `mat_${row[5]}`,
        materialName: row[5] || '',
        supplierCode: row[6] || '',
        lotNumber: row[7] || '',
        customer: row[8],
        month: row[9] || '',
        supervisor: row[10] || '',
        operator: row[11] || '',
        productionQuantity: parseFloat(row[13]) || 0,
        lineSpeedReal: parseFloat(row[14]) || 0,
        lineSpeedCalc: parseFloat(row[15]) || 0,
        lineSpeedRealPerHour: (parseFloat(row[14]) || 0) * 60,
        lineSpeedCalcPerHour: (parseFloat(row[15]) || 0) * 60,
        productWeightReal: parseFloat(row[16]) || 0,
        productWeightCalc: parseFloat(row[17]) || 0,
        wasteVulcanized: parseFloat(row[18]) || 0,
        wasteNonVulcanized: parseFloat(row[19]) || 0,
        totalDevelopmentWeight: parseFloat(row[21]) || 0,
        startTime: parseExcelTime(row[22]),
        endTime: parseExcelTime(row[23]),
        realTime: parseFloat(row[24]) || 0,
        calcTime: parseFloat(row[25]) || 0,
        totalTime: parseFloat(row[25]) || 0,
        notes: row[27]
      });
    }
  }
  
  return development;
};

const parseInventoryData = (rawData: any[]): InventoryRecord[] => {
  const inventory: InventoryRecord[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'P. č.') {
      inventory.push({
        id: `inv_${i}`,
        recordNumber: row[0] || '',
        mixtureType: row[1] || 'Extrůzní',
        materialId: `mat_${row[2]}`,
        materialName: row[2] || '',
        supplierCode: row[3] || '',
        lotNumber: row[4] || '',
        storageMonth: row[5] || '',
        productionDate: parseExcelDate(row[6]),
        expirationDate: parseExcelDate(row[7]),
        storageDate: parseExcelDate(row[8]),
        quantity: parseFloat(row[9]) || 0,
        storedBy: row[10] || '',
        extensionDate: parseExcelDate(row[11]),
        writtenOff: parseFloat(row[12]) || 0,
        writtenOffBy: row[13],
        writeOffReason: row[14],
        notes: row[15]
      });
    }
  }
  
  return inventory;
};

const parseWasteData = (rawData: any[]): WasteRecord[] => {
  const waste: WasteRecord[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'P. č.') {
      waste.push({
        id: `waste_${i}`,
        recordNumber: parseFloat(row[0]) || 0,
        exportDate: parseExcelDate(row[1]),
        month: row[2] || '',
        wasteType: row[3] || 'Vulkanizovaný extruze',
        weight: parseFloat(row[4]) || 0,
        recordedBy: row[5] || '',
        notes: row[6]
      });
    }
  }
  
  return waste;
};

const parseRequirementsData = (rawData: any[]): RequirementRecord[] => {
  const requirements: RequirementRecord[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'P. č.') {
      requirements.push({
        id: `req_${i}`,
        recordNumber: parseFloat(row[0]) || 0,
        entryDate: parseExcelDate(row[1]),
        year: parseFloat(row[2]) || new Date().getFullYear(),
        requirement: row[3] || '',
        enteredBy: row[4] || '',
        completionPercent: parseFloat(row[5]) || 0,
        notes: row[6]
      });
    }
  }
  
  return requirements;
};

const parseProductionAnalysisData = (rawData: any[]): ProductionAnalysis[] => {
  const analysis: ProductionAnalysis[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'Měsíc') {
      analysis.push({
        month: row[0] || '',
        totalProductsWeightCalc: parseFloat(row[1]) || 0,
        totalProductsWeightReal: parseFloat(row[2]) || 0,
        productWeightDifference: parseFloat(row[3]) || 0,
        totalWasteWeightCalc: parseFloat(row[4]) || 0,
        totalWasteWeightReal: parseFloat(row[5]) || 0,
        wasteWeightDifference: parseFloat(row[6]) || 0,
        realTime: row[7] || '',
        calculatedTime: row[8] || '',
        weightEfficiencyPercent: parseFloat(row[9]) || 0,
        timeEfficiencyPercent: parseFloat(row[10]) || 0
      });
    }
  }
  
  return analysis;
};

const parseInventoryAnalysisData = (rawData: any[]): InventoryAnalysis[] => {
  const analysis: InventoryAnalysis[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'Měsíc') {
      analysis.push({
        month: row[0] || '',
        extrusionMixturesStored: parseFloat(row[1]) || 0,
        pressingMixturesStored: parseFloat(row[2]) || 0,
        writtenOff: parseFloat(row[3]) || 0
      });
    }
  }
  
  return analysis;
};

const parseWasteAnalysisData = (rawData: any[]): WasteAnalysis[] => {
  const analysis: WasteAnalysis[] = [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0] && row[0] !== 'Měsíc') {
      analysis.push({
        month: row[0] || '',
        nonVulcanizedExtrusion: parseFloat(row[1]) || 0,
        vulcanizedExtrusion: parseFloat(row[2]) || 0,
        nonVulcanizedExpired: parseFloat(row[3]) || 0,
        nonVulcanizedConfection: parseFloat(row[4]) || 0,
        vulcanizedConfection: parseFloat(row[5]) || 0,
        total: parseFloat(row[6]) || 0
      });
    }
  }
  
  return analysis;
};

const parseExcelDate = (value: any): Date => {
  if (!value) return new Date();
  
  if (typeof value === 'number') {
    // Excel serial date
    return new Date((value - 25569) * 86400 * 1000);
  }
  
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  
  return new Date();
};

const parseExcelTime = (value: any): Date => {
  if (!value) return new Date();
  
  if (typeof value === 'number') {
    // Excel time fraction
    const hours = Math.floor(value * 24);
    const minutes = Math.floor((value * 24 - hours) * 60);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  if (typeof value === 'string') {
    const date = new Date();
    const [hours, minutes] = value.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }
  
  return new Date();
};

export const exportToExcel = (data: ExcelImportData, filename: string = 'vmq_data.xlsx') => {
  const workbook = XLSX.utils.book_new();
  
  // Export materials
  const materialsWS = XLSX.utils.json_to_sheet(data.materials);
  XLSX.utils.book_append_sheet(workbook, materialsWS, 'Materials');
  
  // Export production
  const productionWS = XLSX.utils.json_to_sheet(data.production);
  XLSX.utils.book_append_sheet(workbook, productionWS, 'Production');
  
  // Export development
  const developmentWS = XLSX.utils.json_to_sheet(data.development);
  XLSX.utils.book_append_sheet(workbook, developmentWS, 'Development');
  
  // Export inventory
  const inventoryWS = XLSX.utils.json_to_sheet(data.inventory);
  XLSX.utils.book_append_sheet(workbook, inventoryWS, 'Inventory');
  
  // Export waste
  const wasteWS = XLSX.utils.json_to_sheet(data.waste);
  XLSX.utils.book_append_sheet(workbook, wasteWS, 'Waste');
  
  // Export requirements
  const requirementsWS = XLSX.utils.json_to_sheet(data.requirements);
  XLSX.utils.book_append_sheet(workbook, requirementsWS, 'Requirements');
  
  // Write file
  XLSX.writeFile(workbook, filename);
};

// New export functions with Czech headers
export const exportVMQToExcel = (data: ExcelImportData, filename: string = 'VMQ_Export') => {
  const workbook = XLSX.utils.book_new();

  // Export Production data
  if (data.production.length > 0) {
    const productionData = data.production.map(record => ({
      'Záznam': record.recordNumber,
      'Článek': record.articleNumber,
      'Rozměry': record.dimensions,
      'Datum': record.date.toLocaleDateString('cs-CZ'),
      'Materiál': record.materialName,
      'Kód dodavatele': record.supplierCode,
      'LOT': record.lotNumber,
      'Zákazník': record.customer,
      'Měsíc': record.month,
      'Předák': record.supervisor,
      'Operátor': record.operator,
      'Výroba (m)': record.productionQuantity,
      'Rychlost Real': record.lineSpeedReal,
      'Rychlost Real/h': record.lineSpeedRealPerHour,
      'Rychlost Calc/h': record.lineSpeedCalcPerHour,
      'Váha Real': record.productWeightReal,
      'Váha Calc': record.productWeightCalc,
      'Odpad Vulk': record.wasteVulcanized,
      'Odpad Vulk %': record.wasteVulcanizedPercentage,
      'Odpad Nevulk': record.wasteNonVulcanized,
      'Odpad Nevulk %': record.wasteNonVulcanizedPercentage,
      'Celkový odpad': record.totalWaste,
      'Celkový odpad %': record.totalWastePercentage,
      'Výroba Real kg': record.totalProductionWeightReal,
      'Celková hmotnost': record.totalProductionWeight,
      'Čas Real': record.actualTime,
      'Čas Calc': record.calculatedTime,
      'Hodnocení kg': record.performanceEvalKg,
      'Hodnocení čas': record.performanceEvalTime,
      'Poznámky': record.notes
    }));
    
    const productionSheet = XLSX.utils.json_to_sheet(productionData);
    XLSX.utils.book_append_sheet(workbook, productionSheet, 'Výroba');
  }

  // Export Development data
  if (data.development.length > 0) {
    const developmentData = data.development.map(record => ({
      'Záznam': record.recordNumber,
      'Článek': record.articleNumber,
      'Rozměry': record.dimensions,
      'Hubice': record.hubiceNumber,
      'Datum': record.date.toLocaleDateString('cs-CZ'),
      'Materiál': record.materialName,
      'Kód dodavatele': record.supplierCode,
      'LOT': record.lotNumber,
      'Zákazník': record.customer,
      'Měsíc': record.month,
      'Předák': record.supervisor,
      'Operátor': record.operator,
      'Výroba (m/ks)': record.productionQuantity,
      'Rychlost Real': record.lineSpeedReal,
      'Rychlost Calc': record.lineSpeedCalc,
      'Váha Real': record.productWeightReal,
      'Váha Calc': record.productWeightCalc,
      'Odpad Vulk': record.wasteVulcanized,
      'Odpad Nevulk': record.wasteNonVulcanized,
      'Hmotnost vývoje': record.totalDevelopmentWeight,
      'Celkový čas': record.totalTime,
      'Poznámky': record.notes
    }));
    
    const developmentSheet = XLSX.utils.json_to_sheet(developmentData);
    XLSX.utils.book_append_sheet(workbook, developmentSheet, 'Vývoj');
  }

  // Export Materials
  if (data.materials.length > 0) {
    const materialsData = data.materials.map(material => ({
      'Název': material.name,
      'Dodavatel': material.supplier,
      'Status': material.status
    }));
    
    const materialsSheet = XLSX.utils.json_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(workbook, materialsSheet, 'Materiály');
  }

  // Export Inventory
  if (data.inventory.length > 0) {
    const inventoryData = data.inventory.map(record => ({
      'Záznam': record.recordNumber,
      'Typ směsi': record.mixtureType,
      'Materiál': record.materialName,
      'Kód dodavatele': record.supplierCode,
      'LOT': record.lotNumber,
      'Měsíc': record.storageMonth,
      'Datum výroby': record.productionDate.toLocaleDateString('cs-CZ'),
      'Datum expirace': record.expirationDate.toLocaleDateString('cs-CZ'),
      'Datum naskladnění': record.storageDate.toLocaleDateString('cs-CZ'),
      'Množství': record.quantity,
      'Naskladnil': record.storedBy,
      'Odepsané': record.writtenOff,
      'Odepsal': record.writtenOffBy,
      'Důvod odpisu': record.writeOffReason,
      'Poznámky': record.notes
    }));
    
    const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Sklad');
  }

  // Export Waste
  if (data.waste.length > 0) {
    const wasteData = data.waste.map(record => ({
      'Záznam': record.recordNumber,
      'Datum vyvezení': record.exportDate.toLocaleDateString('cs-CZ'),
      'Měsíc': record.month,
      'Druh odpadu': record.wasteType,
      'Váha': record.weight,
      'Zapsal': record.recordedBy,
      'Poznámky': record.notes
    }));
    
    const wasteSheet = XLSX.utils.json_to_sheet(wasteData);
    XLSX.utils.book_append_sheet(workbook, wasteSheet, 'Odpady');
  }

  // Generate and download file
  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
};

export const exportProductionToExcel = (production: ProductionRecord[], filename: string = 'VMQ_Výroba') => {
  const data: ExcelImportData = {
    materials: [],
    production,
    development: [],
    inventory: [],
    waste: [],
    requirements: [],
    productionAnalysis: [],
    inventoryAnalysis: [],
    wasteAnalysis: []
  };
  
  exportVMQToExcel(data, filename);
};

export const exportDevelopmentToExcel = (development: DevelopmentRecord[], filename: string = 'VMQ_Vývoj') => {
  const data: ExcelImportData = {
    materials: [],
    production: [],
    development,
    inventory: [],
    waste: [],
    requirements: [],
    productionAnalysis: [],
    inventoryAnalysis: [],
    wasteAnalysis: []
  };
  
  exportVMQToExcel(data, filename);
};