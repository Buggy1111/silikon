import * as XLSX from 'xlsx';
import { Material, ProductionRecord, DevelopmentRecord, InventoryRecord, WasteRecord } from '../types';
import { addDays } from 'date-fns';

// Funkce pro čištění dat z Excelu
const cleanValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/^-+$/, '').replace(/^-$/, '');
};

const cleanNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const cleanDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  
  // Pokud je to Excel serial number
  if (typeof value === 'number') {
    // Excel serial date konverze
    const excelEpoch = new Date(1900, 0, 1);
    const days = value - 2; // Excel má bug s rokem 1900
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  return new Date(value);
};

// Import materiálů z M_Data listu
export const importMaterialsFromExcel = async (): Promise<Material[]> => {
  try {
    const response = await fetch('/VMQ_Ztráty_Extruze_2025.xls');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    const worksheet = workbook.Sheets['M_Data'];
    if (!worksheet) {
      console.error('M_Data list nenalezen');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const materials: Material[] = [];
    
    // Přeskočit hlavičku a zpracovat data
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row || row.length < 8) continue;
      
      const materialName = cleanValue(row[1]); // VMQ směsi
      const supplier = cleanValue(row[0]); // Dodavatel
      const status = cleanValue(row[7]); // Stav
      
      if (materialName && materialName !== '------' && materialName !== '-') {
        materials.push({
          id: `mat_${i}`,
          name: materialName,
          supplier: supplier || 'Nezadáno',
          status: mapStatus(status)
        });
      }
    }
    
    return materials;
  } catch (error) {
    console.error('Chyba při importu materiálů:', error);
    return [];
  }
};

// Import výrobních záznamů z Extruze listu (skutečná výroba)
export const importProductionFromExcel = async (): Promise<ProductionRecord[]> => {
  try {
    const response = await fetch('/VMQ_Ztráty_Extruze_2025.xls');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    const worksheet = workbook.Sheets['Extruze'];
    if (!worksheet) {
      console.error('Extruze list nenalezen');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const production: ProductionRecord[] = [];
    
    // Přeskočit hlavičku a zpracovat data
    for (let i = 2; i < Math.min(data.length, 200); i++) { // Omezit na prvních 200 záznamů
      const row = data[i] as any[];
      if (!row || row.length < 45) continue;
      
      // Základní informace
      const recordNumber = cleanValue(row[0]);
      const articleNumber = cleanValue(row[1]);
      const dimensions = cleanValue(row[2]);
      const date = cleanDate(row[3]);
      const materialName = cleanValue(row[4]) || cleanValue(row[5]);
      const lotNumber = cleanValue(row[6]);
      const customer = cleanValue(row[7]);
      const month = cleanValue(row[8]);
      const supervisor = cleanValue(row[9]); // Řídící (předák)
      const operator = cleanValue(row[10]); // Parták (operátor)
      const production_m = cleanNumber(row[12]);
      const lineSpeedReal = cleanNumber(row[13]); // Rychlost linky (m/min) - Real
      const lineSpeedCalc = cleanNumber(row[14]); // Rychlost linky (m/min) - Kalkul
      
      // Rychlosti v m/h
      const lineSpeedRealPerHour = cleanNumber(row[15]); // Přepočet rychlosti linky (m/hod) - Real
      const lineSpeedCalcPerHour = cleanNumber(row[16]); // Přepočet rychlosti linky (m/hod) - Kalkul
      
      // Váhy výrobků
      const productWeightReal = cleanNumber(row[17]);
      const productWeightCalc = cleanNumber(row[18]);
      
      // Odpady vulkanizované
      const wasteVulcanized = cleanNumber(row[19]);
      const wasteVulcanizedCalc = cleanNumber(row[20]);
      const wasteVulcanizedPercentage = cleanNumber(row[21]);
      
      // Odpady nevulkanizované  
      const wasteNonVulcanized = cleanNumber(row[22]);
      const wasteNonVulcanizedCalc = cleanNumber(row[23]);
      const wasteNonVulcanizedPercentage = cleanNumber(row[24]);
      
      // Celkové odpady
      const totalWaste = cleanNumber(row[25]);
      const totalWasteCalc = cleanNumber(row[26]);
      const totalWastePercentage = cleanNumber(row[27]);
      
      // Váhy výroby
      const productionWeightReal = cleanNumber(row[28]);
      const productionWeightCalc = cleanNumber(row[30]);
      const productionWeightPercentage = cleanNumber(row[31]);
      const totalProductionWeight = cleanNumber(row[32]);
      const totalProductionWeightReal = cleanNumber(row[33]);
      
      // Časy
      const startTime = cleanDate(row[34]);
      const endTime = cleanDate(row[35]);
      const actualTimeDisplay = cleanValue(row[36]);
      const actualTime = cleanNumber(row[37]);
      const calculatedTime = cleanNumber(row[38]);
      
      // Hodnocení výkonnosti
      const performanceEvalKg = cleanNumber(row[41]);
      const performanceEvalTime = cleanNumber(row[42]);
      
      // Poznámky
      const notes = cleanValue(row[44]);
      
      if (materialName && materialName !== '------' && materialName !== '-') {
        production.push({
          id: `prod_${i}`,
          recordNumber: recordNumber || `${i}`,
          articleNumber: articleNumber || '',
          dimensions: dimensions || '',
          materialId: `mat_${materialName}`,
          materialName: materialName,
          supplierCode: lotNumber || `LOT-${i}`,
          lotNumber: lotNumber || `LOT-${i}`,
          customer: customer || 'Nezadáno',
          month: month || date.toLocaleDateString('cs-CZ', { month: 'long' }),
          supervisor: supervisor || 'Nezadáno',
          operator: operator || 'Nezadáno',
          date: date,
          productionQuantity: production_m,
          lineSpeedReal: lineSpeedReal,
          lineSpeedCalc: lineSpeedCalc,
          lineSpeedRealPerHour: lineSpeedRealPerHour,
          lineSpeedCalcPerHour: lineSpeedCalcPerHour,
          productWeightReal: productWeightReal,
          productWeightCalc: productWeightCalc,
          wasteVulcanized: wasteVulcanized,
          wasteVulcanizedCalc: wasteVulcanizedCalc,
          wasteVulcanizedPercentage: wasteVulcanizedPercentage,
          wasteNonVulcanized: wasteNonVulcanized,
          wasteNonVulcanizedCalc: wasteNonVulcanizedCalc,
          wasteNonVulcanizedPercentage: wasteNonVulcanizedPercentage,
          totalWaste: totalWaste,
          totalWasteCalc: totalWasteCalc,
          totalWastePercentage: totalWastePercentage,
          totalProductionWeight: totalProductionWeight,
          totalProductionWeightReal: totalProductionWeightReal,
          totalWeight: totalProductionWeight + totalWaste,
          startTime: startTime.getTime() ? startTime : date,
          endTime: endTime.getTime() ? endTime : addDays(date, 1),
          actualTime: actualTime,
          calculatedTime: calculatedTime,
          actualTimeDisplay: actualTimeDisplay,
          performanceEvalKg: performanceEvalKg,
          performanceEvalTime: performanceEvalTime,
          notes: notes || ''
        });
      }
    }
    
    return production;
  } catch (error) {
    console.error('Chyba při importu výroby:', error);
    return [];
  }
};

// Import vývojových záznamů z Vývoje listu
export const importDevelopmentFromExcel = async (): Promise<DevelopmentRecord[]> => {
  try {
    const response = await fetch('/VMQ_Ztráty_Extruze_2025.xls');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    const worksheet = workbook.Sheets['Vývoje'];
    if (!worksheet) {
      console.error('Vývoje list nenalezen');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const development: DevelopmentRecord[] = [];
    
    // Přeskočit hlavičku a zpracovat data
    for (let i = 2; i < Math.min(data.length, 50); i++) { // Omezit na prvních 50 záznamů
      const row = data[i] as any[];
      if (!row || row.length < 20) continue;
      
      const articleNumber = cleanValue(row[1]); // Artikl
      const dimensions = cleanValue(row[2]); // Rozměr  
      const hubiceNumber = cleanValue(row[3]); // Označení šuplíku hubice
      const date = cleanDate(row[4]); // Datum vývoje
      const materialName = cleanValue(row[5]) || cleanValue(row[6]); // Označení směsi
      const lotNumber = cleanValue(row[7]); // LOT číslo
      const customer = cleanValue(row[8]); // Zákazník
      const supervisor = cleanValue(row[10]); // Řídící (předák)
      const operator = cleanValue(row[11]); // Parták (operátor)
      const production_m = cleanNumber(row[13]); // Výroba (m/ks)
      const lineSpeedReal = cleanNumber(row[14]); // Rychlost linky Real
      const lineSpeedCalc = cleanNumber(row[15]); // Rychlost linky Kalkul
      
      // Rychlosti per hour (vypočítané z m/min)
      const lineSpeedRealPerHour = lineSpeedReal * 60;
      const lineSpeedCalcPerHour = lineSpeedCalc * 60;
      
      const productWeightReal = cleanNumber(row[16]); // Váha výrobku Real
      const productWeightCalc = cleanNumber(row[17]); // Váha výrobku Kalkul
      const wasteVulk = cleanNumber(row[18]); // Odpady Vulk
      const wasteNonVulk = cleanNumber(row[19]); // Odpady Nevulk
      const totalDevWeight = cleanNumber(row[20]); // Hmotnost vývoje
      const totalTime = cleanNumber(row[25]); // Σ - Čas
      
      if (materialName && materialName !== '------' && materialName !== '-') {
        development.push({
          id: `dev_${i}`,
          recordNumber: `${i}`,
          articleNumber: articleNumber || '',
          dimensions: dimensions || '',
          hubiceNumber: hubiceNumber || '',
          date: date,
          materialId: `mat_${materialName}`,
          materialName: materialName,
          supplierCode: lotNumber || `LOT-${i}`,
          lotNumber: lotNumber || `LOT-${i}`,
          customer: customer || 'Vývoj',
          month: date.toLocaleDateString('cs-CZ', { month: 'long' }),
          supervisor: supervisor || 'Nezadáno',
          operator: operator || 'Nezadáno',
          productionQuantity: production_m,
          lineSpeedReal: lineSpeedReal,
          lineSpeedCalc: lineSpeedCalc,
          lineSpeedRealPerHour: lineSpeedRealPerHour,
          lineSpeedCalcPerHour: lineSpeedCalcPerHour,
          productWeightReal: productWeightReal,
          productWeightCalc: productWeightCalc,
          wasteVulcanized: wasteVulk,
          wasteNonVulcanized: wasteNonVulk,
          totalDevelopmentWeight: totalDevWeight,
          startTime: date,
          endTime: addDays(date, 1),
          realTime: totalTime,
          calcTime: totalTime * 0.9,
          totalTime: totalTime,
          notes: ''
        });
      }
    }
    
    return development;
  } catch (error) {
    console.error('Chyba při importu vývoje:', error);
    return [];
  }
};

// Import skladových záznamů z VMQ sklad směsí listu
export const importInventoryFromExcel = async (): Promise<InventoryRecord[]> => {
  try {
    const response = await fetch('/VMQ_Sklad_materiálu_2025.xls');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    const worksheet = workbook.Sheets['VMQ sklad směsí'];
    if (!worksheet) {
      console.error('VMQ sklad směsí list nenalezen');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const inventory: InventoryRecord[] = [];
    
    // Přeskočit hlavičku a zpracovat data
    for (let i = 2; i < Math.min(data.length, 100); i++) { // Omezit na prvních 100 záznamů
      const row = data[i] as any[];
      if (!row || row.length < 15) continue;
      
      const mixtureType = cleanValue(row[1]); // Druh směsi
      const materialName = cleanValue(row[2]); // Označení směsi profily
      const supplierCode = cleanValue(row[3]); // Označení směsi dodavatel
      const lotNumber = cleanValue(row[4]); // LOT číslo
      const productionDate = cleanDate(row[6]); // Datum výroby směsi
      const expirationDate = cleanDate(row[7]); // Datum expirace směsi
      const storageDate = cleanDate(row[8]); // Datum naskladnění
      const quantity = cleanNumber(row[9]); // Naskladněné množství
      const storedBy = cleanValue(row[10]); // Naskladnil
      const writeOff = cleanNumber(row[12]); // Odepsané
      const writeOffBy = cleanValue(row[13]); // Odepsal
      const writeOffReason = cleanValue(row[14]); // Důvod odpisu
      
      if (materialName && materialName !== '------' && materialName !== '-' && quantity > 0) {
        inventory.push({
          id: `inv_${i}`,
          recordNumber: `${i}`,
          mixtureType: mapMixtureType(mixtureType),
          materialId: `mat_${materialName}`,
          materialName: materialName,
          supplierCode: supplierCode || 'Nezadáno',
          lotNumber: lotNumber || `LOT-${i}`,
          storageMonth: productionDate.toLocaleDateString('cs-CZ', { month: 'long' }),
          productionDate: productionDate,
          expirationDate: expirationDate,
          storageDate: storageDate,
          quantity: quantity,
          storedBy: storedBy || 'Nezadáno',
          writtenOff: writeOff,
          writtenOffBy: writeOffBy || '',
          writeOffReason: writeOffReason || 'Žádný',
          notes: ''
        });
      }
    }
    
    return inventory;
  } catch (error) {
    console.error('Chyba při importu skladu:', error);
    return [];
  }
};

// Import odpadů z Zápis odpadů listu
export const importWasteFromExcel = async (): Promise<WasteRecord[]> => {
  try {
    const response = await fetch('/VMQ_Sklad_materiálu_2025.xls');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    const worksheet = workbook.Sheets['Zápis odpadů'];
    if (!worksheet) {
      console.error('Zápis odpadů list nenalezen');
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const waste: WasteRecord[] = [];
    
    // Přeskočit hlavičku a zpracovat data
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row || row.length < 6) continue;
      
      const exportDate = cleanDate(row[1]); // Datum vyvezení
      const month = cleanValue(row[2]); // Měsíc
      const wasteType = cleanValue(row[3]); // Druh odpadu
      const weight = cleanNumber(row[4]); // Váha
      const recordedBy = cleanValue(row[5]); // Zapsal / Zvážil
      const notes = cleanValue(row[6]); // Poznámky
      
      if (wasteType && wasteType !== '------' && weight > 0) {
        const mappedWasteType = mapWasteType(wasteType);
        if (mappedWasteType !== 'Ostatní') {
          waste.push({
            id: `waste_${i}`,
            recordNumber: i,
            exportDate: exportDate,
            month: month || 'Nezadáno',
            wasteType: mappedWasteType as 'Vulkanizovaný extruze' | 'Nevulkanizovaný extruze' | 'Vulkanizovaný konfekce' | 'Nevulkanizovaný konfekce',
            weight: weight,
            recordedBy: recordedBy || 'Nezadáno',
            notes: notes || ''
          });
        }
      }
    }
    
    return waste;
  } catch (error) {
    console.error('Chyba při importu odpadů:', error);
    return [];
  }
};

// Mapování statusů
const mapStatus = (status: string): 'Testovací' | 'Výroba' | 'Vývoj' | 'Archiv' | 'Aktivní' | '-' => {
  const cleanStatus = status.toLowerCase();
  if (cleanStatus.includes('test')) return 'Testovací';
  if (cleanStatus.includes('výrob')) return 'Výroba';
  if (cleanStatus.includes('vývoj')) return 'Vývoj';
  if (cleanStatus.includes('archiv')) return 'Archiv';
  if (cleanStatus.includes('aktiv')) return 'Aktivní';
  return '-';
};

// Mapování typů směsí
const mapMixtureType = (type: string): 'Extrůzní' | 'Lisovací' => {
  return type?.toLowerCase().includes('lisovc') ? 'Lisovací' : 'Extrůzní';
};

// Mapování typů odpadů
const mapWasteType = (type: string): 'Vulkanizovaný extruze' | 'Nevulkanizovaný extruze' | 'Vulkanizovaný konfekce' | 'Nevulkanizovaný konfekce' | 'Ostatní' => {
  const cleanType = type.toLowerCase();
  if (cleanType.includes('vulkanizovaný') && cleanType.includes('extruze')) return 'Vulkanizovaný extruze';
  if (cleanType.includes('nevulkanizovaný') && cleanType.includes('extruze')) return 'Nevulkanizovaný extruze';
  if (cleanType.includes('vulkanizovaný') && cleanType.includes('konfekce')) return 'Vulkanizovaný konfekce';
  if (cleanType.includes('nevulkanizovaný') && cleanType.includes('konfekce')) return 'Nevulkanizovaný konfekce';
  return 'Ostatní';
};

// Import všech dat najednou
export const importAllRealData = async () => {
  try {
    console.log('🔄 Začínám import skutečných dat z Excel souborů...');
    
    const [materials, production, development, inventory, waste] = await Promise.all([
      importMaterialsFromExcel(),
      importProductionFromExcel(),
      importDevelopmentFromExcel(),
      importInventoryFromExcel(),
      importWasteFromExcel()
    ]);
    
    console.log('✅ Import dokončen:', {
      materials: materials.length,
      production: production.length,
      development: development.length,
      inventory: inventory.length,
      waste: waste.length
    });
    
    return {
      materials,
      production,
      development,
      inventory,
      waste
    };
  } catch (error) {
    console.error('❌ Chyba při importu dat:', error);
    throw error;
  }
};