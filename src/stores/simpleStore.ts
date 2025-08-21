import { create } from 'zustand';
import { 
  ExcelImportData, 
  Material, 
  ProductionRecord, 
  DevelopmentRecord, 
  InventoryRecord, 
  WasteRecord,
  RequirementRecord,
  ProductionAnalysis,
  InventoryAnalysis,
  WasteAnalysis,
  ViewType,
  User
} from '../types';
import { importAllRealData } from '../utils/realDataImport';

interface AppState {
  // Authentication
  user: User | null;
  
  // Current view
  currentView: ViewType;
  
  // Data
  materials: Material[];
  production: ProductionRecord[];
  development: DevelopmentRecord[];
  inventory: InventoryRecord[];
  waste: WasteRecord[];
  requirements: RequirementRecord[];
  productionAnalysis: ProductionAnalysis[];
  inventoryAnalysis: InventoryAnalysis[];
  wasteAnalysis: WasteAnalysis[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  setData: (data: ExcelImportData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data operations
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  addProductionRecord: (record: ProductionRecord) => void;
  updateProductionRecord: (id: string, record: Partial<ProductionRecord>) => void;
  deleteProductionRecord: (id: string) => void;
  
  addDevelopmentRecord: (record: DevelopmentRecord) => void;
  updateDevelopmentRecord: (id: string, record: Partial<DevelopmentRecord>) => void;
  deleteDevelopmentRecord: (id: string) => void;
  
  addInventoryRecord: (record: InventoryRecord) => void;
  updateInventoryRecord: (id: string, record: Partial<InventoryRecord>) => void;
  deleteInventoryRecord: (id: string) => void;
  archiveInventoryRecord: (id: string, reason: string, archivedBy: string) => void;
  
  addWasteRecord: (record: WasteRecord) => void;
  updateWasteRecord: (id: string, record: Partial<WasteRecord>) => void;
  deleteWasteRecord: (id: string) => void;
  
  addRequirement: (requirement: RequirementRecord) => void;
  updateRequirement: (id: string, requirement: Partial<RequirementRecord>) => void;
  deleteRequirement: (id: string) => void;
  
  // Analytics
  getProductionEfficiency: () => number;
  getWastePercentage: () => number;
  getInventoryTurnover: () => number;
  getMonthlyProduction: () => { month: string; total: number }[];
  getTopMaterials: () => { material: string; usage: number }[];
  
  // Real data import
  loadRealData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  currentView: 'dashboard',
  materials: [],
  production: [],
  development: [],
  inventory: [],
  waste: [],
  requirements: [],
  productionAnalysis: [],
  inventoryAnalysis: [],
  wasteAnalysis: [],
  isLoading: false,
  error: null,
  
  // Auth actions
  login: (username, password) => {
    if (username === 'Silikon' && password === 'Silikon') {
      set({ 
        user: { 
          username: 'Silikon', 
          isAuthenticated: true, 
          role: 'admin' 
        } 
      });
      return true;
    }
    return false;
  },
  
  logout: () => set({ user: null }),

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  
  setData: (data) => set({
    materials: data.materials,
    production: data.production,
    development: data.development,
    inventory: data.inventory,
    waste: data.waste,
    requirements: data.requirements,
    productionAnalysis: data.productionAnalysis,
    inventoryAnalysis: data.inventoryAnalysis,
    wasteAnalysis: data.wasteAnalysis,
    error: null
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Material operations
  addMaterial: (material) => set((state) => ({
    materials: [...state.materials, material]
  })),
  
  updateMaterial: (id, updatedMaterial) => set((state) => ({
    materials: state.materials.map(m => 
      m.id === id ? { ...m, ...updatedMaterial } : m
    )
  })),
  
  deleteMaterial: (id) => set((state) => ({
    materials: state.materials.filter(m => m.id !== id)
  })),
  
  // Production operations
  addProductionRecord: (record) => set((state) => ({
    production: [...state.production, record]
  })),
  
  updateProductionRecord: (id, updatedRecord) => set((state) => ({
    production: state.production.map(r => 
      r.id === id ? { ...r, ...updatedRecord } : r
    )
  })),
  
  deleteProductionRecord: (id) => set((state) => ({
    production: state.production.filter(r => r.id !== id)
  })),
  
  // Development operations
  addDevelopmentRecord: (record) => set((state) => ({
    development: [...state.development, record]
  })),
  
  updateDevelopmentRecord: (id, updatedRecord) => set((state) => ({
    development: state.development.map(r => 
      r.id === id ? { ...r, ...updatedRecord } : r
    )
  })),
  
  deleteDevelopmentRecord: (id) => set((state) => ({
    development: state.development.filter(r => r.id !== id)
  })),
  
  // Inventory operations
  addInventoryRecord: (record) => set((state) => ({
    inventory: [...state.inventory, record]
  })),
  
  updateInventoryRecord: (id, updatedRecord) => set((state) => ({
    inventory: state.inventory.map(r => 
      r.id === id ? { ...r, ...updatedRecord } : r
    )
  })),
  
  deleteInventoryRecord: (id) => set((state) => ({
    inventory: state.inventory.filter(r => r.id !== id)
  })),
  
  archiveInventoryRecord: (id, reason, archivedBy) => set((state) => ({
    inventory: state.inventory.map(r => 
      r.id === id ? { 
        ...r, 
        isArchived: true, 
        archivedDate: new Date(), 
        archivedBy, 
        archiveReason: reason 
      } : r
    )
  })),
  
  // Waste operations
  addWasteRecord: (record) => set((state) => ({
    waste: [...state.waste, record]
  })),
  
  updateWasteRecord: (id, updatedRecord) => set((state) => ({
    waste: state.waste.map(r => 
      r.id === id ? { ...r, ...updatedRecord } : r
    )
  })),
  
  deleteWasteRecord: (id) => set((state) => ({
    waste: state.waste.filter(r => r.id !== id)
  })),
  
  // Requirement operations
  addRequirement: (requirement) => set((state) => ({
    requirements: [...state.requirements, requirement]
  })),
  
  updateRequirement: (id, updatedRequirement) => set((state) => ({
    requirements: state.requirements.map(r => 
      r.id === id ? { ...r, ...updatedRequirement } : r
    )
  })),
  
  deleteRequirement: (id) => set((state) => ({
    requirements: state.requirements.filter(r => r.id !== id)
  })),
  
  // Analytics
  getProductionEfficiency: () => {
    const state = get();
    if (state.production.length === 0) return 85.5; // Default hodnota
    
    const totalReal = state.production.reduce((sum, r) => sum + (r.productWeightReal || 0), 0);
    const totalCalc = state.production.reduce((sum, r) => sum + (r.productWeightCalc || 0), 0);
    
    return totalCalc > 0 ? (totalReal / totalCalc) * 100 : 85.5;
  },
  
  getWastePercentage: () => {
    const state = get();
    if (state.production.length === 0) return 4.2; // Default hodnota
    
    const totalProduction = state.production.reduce((sum, r) => sum + (r.totalProductionWeight || 0), 0);
    const totalWaste = state.production.reduce((sum, r) => sum + (r.wasteVulcanized || 0) + (r.wasteNonVulcanized || 0), 0);
    const totalMaterial = totalProduction + totalWaste;
    
    return totalMaterial > 0 ? (totalWaste / totalMaterial) * 100 : 4.2;
  },
  
  getInventoryTurnover: () => {
    const state = get();
    if (state.inventory.length === 0) return 0;
    
    const totalStored = state.inventory.reduce((sum, r) => sum + r.quantity, 0);
    const totalUsed = state.production.reduce((sum, r) => sum + r.totalProductionWeight, 0);
    
    return totalStored > 0 ? totalUsed / totalStored : 0;
  },
  
  getMonthlyProduction: () => {
    const state = get();
    const monthlyData = state.production.reduce((acc, record) => {
      // Extrahovat měsíc z data
      const month = record.date.toLocaleDateString('cs-CZ', { month: 'long' });
      acc[month] = (acc[month] || 0) + (record.totalProductionWeight || 0);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total
    }));
  },
  
  getTopMaterials: () => {
    const state = get();
    const materialUsage = state.production.reduce((acc, record) => {
      const materialName = record.materialName;
      acc[materialName] = (acc[materialName] || 0) + record.totalProductionWeight;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(materialUsage)
      .map(([material, usage]) => ({ material, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  },
  
  // Load real data from Excel files
  loadRealData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔄 Načítám skutečná data z Excel souborů...');
      const realData = await importAllRealData();
      
      set({
        materials: realData.materials,
        production: realData.production,
        development: realData.development,
        inventory: realData.inventory,
        waste: realData.waste,
        requirements: [], // Zatím prázdné
        productionAnalysis: [], // Zatím prázdné
        inventoryAnalysis: [], // Zatím prázdné
        wasteAnalysis: [], // Zatím prázdné
        isLoading: false,
        error: null
      });
      
      console.log('✅ Skutečná data úspěšně načtena!');
    } catch (error) {
      console.error('❌ Chyba při načítání dat:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Chyba při načítání dat' 
      });
    }
  }
}));