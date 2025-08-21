import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/simpleStore';
import { WasteRecord } from '../types';
import { 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Recycle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Waste: React.FC = () => {
  const { waste, addWasteRecord, updateWasteRecord, deleteWasteRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WasteRecord | null>(null);

  const wasteTypes = [
    'Vulkanizovaný extruze',
    'Nevulkanizovaný extruze',
    'Vulkanizovaný konfekce',
    'Nevulkanizovaný konfekce'
  ];

  const filteredWaste = useMemo(() => {
    return waste.filter(record => {
      const matchesSearch = record.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.recordedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || record.wasteType === filterType;
      const matchesMonth = !filterMonth || record.month === filterMonth;
      
      return matchesSearch && matchesType && matchesMonth;
    });
  }, [waste, searchTerm, filterType, filterMonth]);

  const uniqueMonths = useMemo(() => {
    return [...new Set(waste.map(w => w.month))].sort();
  }, [waste]);

  const handleAddRecord = (record: Partial<WasteRecord>) => {
    const newRecord: WasteRecord = {
      id: `waste_${Date.now()}`,
      recordNumber: waste.length + 1,
      exportDate: new Date(),
      month: new Date().toLocaleString('cs-CZ', { month: 'long' }),
      wasteType: 'Vulkanizovaný extruze',
      weight: 0,
      recordedBy: '',
      ...record
    };
    addWasteRecord(newRecord);
    setShowAddForm(false);
  };

  const handleUpdateRecord = (record: Partial<WasteRecord>) => {
    if (editingRecord) {
      updateWasteRecord(editingRecord.id, record);
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento záznam?')) {
      deleteWasteRecord(id);
    }
  };

  const wasteByType = useMemo(() => {
    return wasteTypes.map(type => ({
      type,
      weight: filteredWaste
        .filter(record => record.wasteType === type)
        .reduce((sum, record) => sum + record.weight, 0)
    })).sort((a, b) => b.weight - a.weight);
  }, [filteredWaste]);

  const monthlyWaste = useMemo(() => {
    const monthlyData = filteredWaste.reduce((acc, record) => {
      const month = record.month;
      acc[month] = (acc[month] || 0) + record.weight;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(monthlyData).map(([month, weight]) => ({
      month,
      weight
    }));
  }, [filteredWaste]);

  const totalWeight = filteredWaste.reduce((sum, record) => sum + record.weight, 0);
  const averageWeight = filteredWaste.length > 0 ? totalWeight / filteredWaste.length : 0;
  const vulcanizedWeight = filteredWaste
    .filter(record => record.wasteType.includes('Vulkanizovaný'))
    .reduce((sum, record) => sum + record.weight, 0);
  const nonVulcanizedWeight = filteredWaste
    .filter(record => record.wasteType.includes('Nevulkanizovaný'))
    .reduce((sum, record) => sum + record.weight, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Odpady</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat záznam
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkový odpad</p>
              <p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(0)} kg</p>
            </div>
            <div className="p-3 rounded-full bg-red-50">
              <Recycle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vulkanizovaný</p>
              <p className="text-2xl font-bold text-gray-900">{vulcanizedWeight.toFixed(0)} kg</p>
            </div>
            <div className="p-3 rounded-full bg-orange-50">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nevulkanizovaný</p>
              <p className="text-2xl font-bold text-gray-900">{nonVulcanizedWeight.toFixed(0)} kg</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <Recycle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Průměr na záznam</p>
              <p className="text-2xl font-bold text-gray-900">{averageWeight.toFixed(0)} kg</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Všechny typy</option>
            {wasteTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

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

          <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste by Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Odpad podle typu</h3>
          <div className="space-y-3">
            {wasteByType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 truncate mr-2">
                  {item.type}
                </span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className="h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      style={{ 
                        width: `${item.weight > 0 ? (item.weight / Math.max(...wasteByType.map(w => w.weight))) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.weight.toFixed(0)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Waste */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Měsíční odpad</h3>
          <div className="space-y-3">
            {monthlyWaste.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{item.month}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ 
                        width: `${item.weight > 0 ? (item.weight / Math.max(...monthlyWaste.map(m => m.weight))) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.weight.toFixed(0)} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Záznam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum vyvezení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ odpadu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Váha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zapsal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poznámky
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWaste.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Recycle className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        #{record.recordNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {record.exportDate.toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.wasteType.includes('Vulkanizovaný') 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.wasteType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.weight.toFixed(0)} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {record.recordedBy}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {record.notes || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default Waste;