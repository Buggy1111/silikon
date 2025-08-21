import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/simpleStore';
import { InventoryRecord } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  History
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const Inventory: React.FC = () => {
  const { inventory, addInventoryRecord, updateInventoryRecord, deleteInventoryRecord, archiveInventoryRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingRecord, setArchivingRecord] = useState<InventoryRecord | null>(null);
  const [archiveReason, setArchiveReason] = useState('');

  const getExpirationStatus = (expirationDate: Date) => {
    const now = new Date();
    const warningDate = addDays(now, 7); // 7 days warning
    
    if (isBefore(expirationDate, now)) {
      return 'expired';
    } else if (isBefore(expirationDate, warningDate)) {
      return 'warning';
    } else {
      return 'ok';
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(record => {
      // Filtrovat podle aktivní záložky
      const isActive = !record.isArchived;
      const isArchived = record.isArchived;
      
      if (activeTab === 'active' && !isActive) return false;
      if (activeTab === 'history' && !isArchived) return false;
      
      const matchesSearch = record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.supplierCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || record.mixtureType === filterType;
      const matchesStatus = !filterStatus || getExpirationStatus(record.expirationDate) === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [inventory, searchTerm, filterType, filterStatus, activeTab]);

  const handleAddRecord = (record: Partial<InventoryRecord>) => {
    const newRecord: InventoryRecord = {
      id: `inv_${Date.now()}`,
      recordNumber: (inventory.length + 1).toString(),
      mixtureType: 'Extrůzní',
      materialId: '',
      materialName: '',
      supplierCode: '',
      lotNumber: '',
      storageMonth: new Date().toLocaleString('cs-CZ', { month: 'long' }),
      productionDate: new Date(),
      expirationDate: new Date(),
      storageDate: new Date(),
      quantity: 0,
      storedBy: '',
      writtenOff: 0,
      ...record
    };
    addInventoryRecord(newRecord);
    setShowAddForm(false);
  };

  const handleUpdateRecord = (record: Partial<InventoryRecord>) => {
    if (editingRecord) {
      updateInventoryRecord(editingRecord.id, record);
      setEditingRecord(null);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tento záznam?')) {
      deleteInventoryRecord(id);
    }
  };

  const handleArchiveRecord = (record: InventoryRecord) => {
    setArchivingRecord(record);
    setShowArchiveModal(true);
  };

  const confirmArchive = () => {
    if (archivingRecord && archiveReason.trim()) {
      archiveInventoryRecord(archivingRecord.id, archiveReason, 'Admin'); // TODO: získat aktuálního uživatele
      setShowArchiveModal(false);
      setArchivingRecord(null);
      setArchiveReason('');
    }
  };

  const expiringCount = inventory.filter(item => getExpirationStatus(item.expirationDate) === 'warning').length;
  const expiredCount = inventory.filter(item => getExpirationStatus(item.expirationDate) === 'expired').length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalWrittenOff = inventory.reduce((sum, item) => sum + item.writtenOff, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sklad materiálů</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat záznam
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aktivní skladové zásoby
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historie směsí
          </button>
        </nav>
      </div>

      {/* Alert Cards */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">Prošlé materiály</h3>
              </div>
              <p className="text-red-700 mt-1">{expiredCount} materiálů již prošlo datum expirace</p>
            </div>
          )}
          
          {expiringCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-800">Brzy expirující</h3>
              </div>
              <p className="text-yellow-700 mt-1">{expiringCount} materiálů expiruje do 7 dnů</p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat materiál, LOT..."
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
            <option value="Extrůzní">Extrůzní</option>
            <option value="Lisovací">Lisovací</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Všechny stavy</option>
            <option value="ok">V pořádku</option>
            <option value="warning">Brzy expiruje</option>
            <option value="expired">Prošlé</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materiál
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LOT číslo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Množství
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiruje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naskladnil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'active' ? 'Stav' : 'Archivace'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'active' ? 'Akce' : 'Informace'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((record) => {
                const status = getExpirationStatus(record.expirationDate);
                const remainingQuantity = record.quantity - record.writtenOff;
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.materialName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.supplierCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {record.lotNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.mixtureType === 'Extrůzní' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.mixtureType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {remainingQuantity.toFixed(0)} kg
                        </div>
                        {record.writtenOff > 0 && (
                          <div className="text-sm text-gray-500">
                            Odepsáno: {record.writtenOff} kg
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {format(record.expirationDate, 'dd.MM.yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {record.storedBy}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'active' ? (
                        <div className="flex items-center">
                          {status === 'ok' && (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm text-green-700">V pořádku</span>
                            </>
                          )}
                          {status === 'warning' && (
                            <>
                              <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                              <span className="text-sm text-yellow-700">Brzy expiruje</span>
                            </>
                          )}
                          {status === 'expired' && (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm text-red-700">Prošlé</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-900">
                            {record.archivedBy}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.archiveReason}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {activeTab === 'active' ? (
                        <>
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Upravit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveRecord(record)}
                            className="text-orange-600 hover:text-orange-900 mr-3"
                            title="Archivovat"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Smazat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Archivováno {record.archivedDate?.toLocaleDateString('cs-CZ')}
                        </span>
                      )}
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
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Celkové množství</h4>
          <p className="text-3xl font-bold text-blue-600">
            {totalQuantity.toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Odepsané množství</h4>
          <p className="text-3xl font-bold text-red-600">
            {totalWrittenOff.toFixed(0)} kg
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Počet položek</h4>
          <p className="text-3xl font-bold text-green-600">
            {filteredInventory.length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Využitelnost</h4>
          <p className="text-3xl font-bold text-purple-600">
            {totalQuantity > 0 ? (((totalQuantity - totalWrittenOff) / totalQuantity) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Archive Modal */}
      {showArchiveModal && archivingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Archive className="w-5 h-5 mr-2 text-orange-500" />
              Archivovat směs
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Archivujete směs: <strong>{archivingRecord.materialName}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                LOT: {archivingRecord.lotNumber}
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Důvod archivace *
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Např. vypršela doba použitelnosti, změna receptury..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowArchiveModal(false);
                  setArchivingRecord(null);
                  setArchiveReason('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button
                onClick={confirmArchive}
                disabled={!archiveReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archivovat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;