import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/simpleStore';
import { ProductionRecord } from '../types';
import ProductionDetailView from './ProductionDetailView';
import ProductionForm from './ProductionForm';
import { exportProductionToExcel } from '../utils/excelUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Calendar,
  Package,
  User,
  Eye
} from 'lucide-react';

const Production: React.FC = () => {
  const { production, addProductionRecord, updateProductionRecord, deleteProductionRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<ProductionRecord | null>(null);

  const filteredProduction = useMemo(() => {
    return production.filter(record => {
      const matchesSearch = record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.customer?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = !filterMonth || record.month === filterMonth;
      const matchesMaterial = !filterMaterial || record.materialName === filterMaterial;
      
      return matchesSearch && matchesMonth && matchesMaterial;
    });
  }, [production, searchTerm, filterMonth, filterMaterial]);

  const uniqueMonths = useMemo(() => {
    return [...new Set(production.map(p => p.month))].sort();
  }, [production]);

  const uniqueMaterials = useMemo(() => {
    return [...new Set(production.map(p => p.materialName))].sort();
  }, [production]);

  const handleAddRecord = (record: Partial<ProductionRecord>) => {
    const newRecord: ProductionRecord = {
      id: `prod_${Date.now()}`,
      recordNumber: (production.length + 1).toString(),
      articleNumber: '',
      dimensions: '',
      date: new Date(),
      materialId: '',
      materialName: '',
      supplierCode: '',
      lotNumber: '',
      customer: '',
      month: new Date().toLocaleString('cs-CZ', { month: 'long' }),
      supervisor: '',
      operator: '',
      productionQuantity: 0,
      lineSpeedReal: 0,
      lineSpeedCalc: 0,
      lineSpeedRealPerHour: 0,
      lineSpeedCalcPerHour: 0,
      productWeightReal: 0,
      productWeightCalc: 0,
      wasteVulcanized: 0,
      wasteVulcanizedCalc: 0,
      wasteVulcanizedPercentage: 0,
      wasteNonVulcanized: 0,
      wasteNonVulcanizedCalc: 0,
      wasteNonVulcanizedPercentage: 0,
      totalWaste: 0,
      totalWasteCalc: 0,
      totalWastePercentage: 0,
      totalProductionWeight: 0,
      totalProductionWeightReal: 0,
      totalWeight: 0,
      startTime: new Date(),
      endTime: new Date(),
      actualTime: 0,
      calculatedTime: 0,
      actualTimeDisplay: '',
      performanceEvalKg: 0,
      performanceEvalTime: 0,
      notes: '',
      ...record
    };
    addProductionRecord(newRecord);
    setShowAddForm(false);
  };

  const handleUpdateRecord = (record: Partial<ProductionRecord>) => {
    if (editingRecord) {
      updateProductionRecord(editingRecord.id, record);
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento záznam?')) {
      deleteProductionRecord(id);
    }
  };

  const handleExport = () => {
    exportProductionToExcel(filteredProduction);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Výroba</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat záznam
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Všechny měsíce</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Všechny materiály</option>
            {uniqueMaterials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>

          <button 
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Záznam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materiál
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Předák / Operátor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výroba (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efektivita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Čas (h)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProduction.map((record) => {
                const efficiency = record.productWeightCalc > 0 
                  ? (record.productWeightReal / record.productWeightCalc) * 100 
                  : 0;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {record.recordNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {record.date.toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.materialName}
                        </div>
                        <div className="text-sm text-gray-500">
                          LOT: {record.lotNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.supervisor}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.operator}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.totalProductionWeight.toFixed(1)} kg
                        </div>
                        <div className="text-sm text-gray-500">
                          Odpad: {(record.wasteVulcanized + record.wasteNonVulcanized).toFixed(1)} kg
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-2 rounded-full ${efficiency >= 90 ? 'bg-green-500' : efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(efficiency, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {efficiency.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.actualTime.toFixed(1)}h
                        </div>
                        <div className="text-sm text-gray-500">
                          Plán: {record.calculatedTime.toFixed(1)}h
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setViewingRecord(record)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Zobrazit detaily"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Upravit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celková výroba</h4>
          <p className="text-3xl font-bold text-blue-600">
            {filteredProduction.reduce((sum, p) => sum + p.totalProductionWeight, 0).toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkový odpad</h4>
          <p className="text-3xl font-bold text-red-600">
            {filteredProduction.reduce((sum, p) => sum + p.wasteVulcanized + p.wasteNonVulcanized, 0).toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Průměrná efektivita</h4>
          <p className="text-3xl font-bold text-green-600">
            {filteredProduction.length > 0 
              ? (filteredProduction.reduce((sum, p) => {
                  const eff = p.productWeightCalc > 0 ? (p.productWeightReal / p.productWeightCalc) : 0;
                  return sum + eff;
                }, 0) / filteredProduction.length * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkový čas</h4>
          <p className="text-3xl font-bold text-purple-600">
            {filteredProduction.reduce((sum, p) => sum + p.actualTime, 0).toFixed(1)} h
          </p>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingRecord) && (
        <ProductionForm 
          record={editingRecord || undefined}
          onSave={editingRecord ? handleUpdateRecord : handleAddRecord}
          onClose={() => {
            setShowAddForm(false);
            setEditingRecord(null);
          }}
        />
      )}

      {/* Detail View Modal */}
      {viewingRecord && (
        <ProductionDetailView 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}
    </div>
  );
};

export default Production;