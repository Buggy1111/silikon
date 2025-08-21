import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/simpleStore';
import { DevelopmentRecord } from '../types';
import DevelopmentDetailView from './DevelopmentDetailView';
import DevelopmentForm from './DevelopmentForm';
import { exportDevelopmentToExcel } from '../utils/excelUtils';
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
  Eye,
  Beaker
} from 'lucide-react';

const Development: React.FC = () => {
  const { development, addDevelopmentRecord, updateDevelopmentRecord, deleteDevelopmentRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DevelopmentRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<DevelopmentRecord | null>(null);

  const filteredDevelopment = useMemo(() => {
    return development.filter(record => {
      const matchesSearch = record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.articleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = !filterMonth || record.month === filterMonth;
      const matchesMaterial = !filterMaterial || record.materialName === filterMaterial;
      
      return matchesSearch && matchesMonth && matchesMaterial;
    });
  }, [development, searchTerm, filterMonth, filterMaterial]);

  const uniqueMonths = useMemo(() => {
    return [...new Set(development.map(d => d.month))].sort();
  }, [development]);

  const uniqueMaterials = useMemo(() => {
    return [...new Set(development.map(d => d.materialName))].sort();
  }, [development]);

  const handleAddRecord = (record: Partial<DevelopmentRecord>) => {
    const newRecord: DevelopmentRecord = {
      id: `dev_${Date.now()}`,
      recordNumber: (development.length + 1).toString(),
      articleNumber: '',
      dimensions: '',
      hubiceNumber: '',
      date: new Date(),
      materialId: '',
      materialName: '',
      supplierCode: '',
      lotNumber: '',
      customer: '',
      month: new Date().toLocaleDateString('cs-CZ', { month: 'long' }),
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
      wasteNonVulcanized: 0,
      totalDevelopmentWeight: 0,
      startTime: new Date(),
      endTime: new Date(),
      realTime: 0,
      calcTime: 0,
      totalTime: 0,
      notes: '',
      ...record
    };
    addDevelopmentRecord(newRecord);
    setShowAddForm(false);
  };

  const handleUpdateRecord = (record: Partial<DevelopmentRecord>) => {
    if (editingRecord) {
      updateDevelopmentRecord(editingRecord.id, record);
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento vývojový záznam?')) {
      deleteDevelopmentRecord(id);
    }
  };

  const handleExport = () => {
    exportDevelopmentToExcel(filteredDevelopment);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Beaker className="w-8 h-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Vývoj</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat vývoj
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat články, materiály, operátory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Všechny měsíce</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

      {/* Development Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Článek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Materiál
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Rozměry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Předák / Operátor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Výroba (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Čas (h)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-purple-700 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevelopment.map((record) => (
                <tr key={record.id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-purple-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.articleNumber || record.recordNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Hubice: {record.hubiceNumber || 'N/A'}
                        </div>
                      </div>
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
                    <span className="text-sm text-gray-900">
                      {record.dimensions || 'N/A'}
                    </span>
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
                        {record.totalDevelopmentWeight.toFixed(1)} kg
                      </div>
                      <div className="text-sm text-gray-500">
                        Odpad: {(record.wasteVulcanized + record.wasteNonVulcanized).toFixed(1)} kg
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.totalTime.toFixed(1)}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setViewingRecord(record)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkový vývoj</h4>
          <p className="text-3xl font-bold text-purple-600">
            {filteredDevelopment.reduce((sum, d) => sum + d.totalDevelopmentWeight, 0).toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Počet článků</h4>
          <p className="text-3xl font-bold text-indigo-600">
            {new Set(filteredDevelopment.map(d => d.articleNumber)).size}
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkový odpad</h4>
          <p className="text-3xl font-bold text-red-600">
            {filteredDevelopment.reduce((sum, d) => sum + d.wasteVulcanized + d.wasteNonVulcanized, 0).toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkový čas</h4>
          <p className="text-3xl font-bold text-orange-600">
            {filteredDevelopment.reduce((sum, d) => sum + d.totalTime, 0).toFixed(1)} h
          </p>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingRecord) && (
        <DevelopmentForm 
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
        <DevelopmentDetailView 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}
    </div>
  );
};

export default Development;