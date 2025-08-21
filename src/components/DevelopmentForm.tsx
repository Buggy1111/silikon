import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DevelopmentRecord } from '../types';
import { 
  X, 
  Save, 
  Calendar, 
  Package, 
  User, 
  FileText,
  Beaker,
  Settings
} from 'lucide-react';

interface DevelopmentFormProps {
  record?: DevelopmentRecord;
  onSave: (record: Partial<DevelopmentRecord>) => void;
  onClose: () => void;
}

const DevelopmentForm: React.FC<DevelopmentFormProps> = ({ record, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    articleNumber: record?.articleNumber || '',
    dimensions: record?.dimensions || '',
    hubiceNumber: record?.hubiceNumber || '',
    date: record?.date ? record.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    materialName: record?.materialName || '',
    supplierCode: record?.supplierCode || '',
    lotNumber: record?.lotNumber || '',
    customer: record?.customer || '',
    supervisor: record?.supervisor || '',
    operator: record?.operator || '',
    productionQuantity: record?.productionQuantity || 0,
    lineSpeedReal: record?.lineSpeedReal || 0,
    lineSpeedCalc: record?.lineSpeedCalc || 0,
    lineSpeedRealPerHour: record?.lineSpeedRealPerHour || 0,
    lineSpeedCalcPerHour: record?.lineSpeedCalcPerHour || 0,
    productWeightReal: record?.productWeightReal || 0,
    productWeightCalc: record?.productWeightCalc || 0,
    wasteVulcanized: record?.wasteVulcanized || 0,
    wasteNonVulcanized: record?.wasteNonVulcanized || 0,
    totalDevelopmentWeight: record?.totalDevelopmentWeight || 0,
    startTime: record?.startTime ? record.startTime.toTimeString().slice(0, 5) : '08:00',
    endTime: record?.endTime ? record.endTime.toTimeString().slice(0, 5) : '16:00',
    totalTime: record?.totalTime || 0,
    notes: record?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHours, startMinutes, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, 0, 0);
    
    const calculatedTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    onSave({
      ...formData,
      date: new Date(formData.date),
      materialId: `mat_${formData.materialName}`,
      month: new Date(formData.date).toLocaleDateString('cs-CZ', { month: 'long' }),
      startTime,
      endTime,
      totalTime: calculatedTime > 0 ? calculatedTime : formData.totalTime
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center">
            <Beaker className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-bold">
              {record ? 'Upravit vývojový záznam' : 'Nový vývojový záznam'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Základní informace */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Základní informace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Číslo článku
                </label>
                <input
                  type="text"
                  value={formData.articleNumber}
                  onChange={(e) => handleChange('articleNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. 2937"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rozměry
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. 18/22 mm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Označení hubice
                </label>
                <input
                  type="text"
                  value={formData.hubiceNumber}
                  onChange={(e) => handleChange('hubiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. 2937"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Datum vývoje
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Materiál */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-500" />
              Materiál
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název směsi *
                </label>
                <input
                  type="text"
                  value={formData.materialName}
                  onChange={(e) => handleChange('materialName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. 70ShA Perox. Black EN455 45"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kód dodavatele
                </label>
                <input
                  type="text"
                  value={formData.supplierCode}
                  onChange={(e) => handleChange('supplierCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. MG9159N70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LOT číslo
                </label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => handleChange('lotNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. 4I280160"
                />
              </div>
            </div>
          </section>

          {/* Personál */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Personál
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zákazník
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleChange('customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Vývoj"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Předák *
                </label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => handleChange('supervisor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. Bürgermeister"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operátor *
                </label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => handleChange('operator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="např. Souček"
                  required
                />
              </div>
            </div>
          </section>

          {/* Výrobní parametry */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-500" />
              Výrobní parametry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Výroba (m/ks)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.productionQuantity}
                  onChange={(e) => handleChange('productionQuantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rychlost Real (m/min)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.lineSpeedReal}
                  onChange={(e) => handleChange('lineSpeedReal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rychlost Calc (m/min)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.lineSpeedCalc}
                  onChange={(e) => handleChange('lineSpeedCalc', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rychlost Real (m/h)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.lineSpeedRealPerHour}
                  onChange={(e) => handleChange('lineSpeedRealPerHour', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rychlost Calc (m/h)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.lineSpeedCalcPerHour}
                  onChange={(e) => handleChange('lineSpeedCalcPerHour', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Váhy a odpady */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Váhy a odpady</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Váha Real (kg/m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.productWeightReal}
                  onChange={(e) => handleChange('productWeightReal', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Váha Calc (kg/m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.productWeightCalc}
                  onChange={(e) => handleChange('productWeightCalc', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odpad Vulk (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wasteVulcanized}
                  onChange={(e) => handleChange('wasteVulcanized', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Odpad Nevulk (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wasteNonVulcanized}
                  onChange={(e) => handleChange('wasteNonVulcanized', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Časy a hmotnost */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Časy a výsledky</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Čas začátku
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Čas konce
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hmotnost vývoje (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalDevelopmentWeight}
                  onChange={(e) => handleChange('totalDevelopmentWeight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Poznámky */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Poznámky
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Poznámky k vývoji..."
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {record ? 'Uložit změny' : 'Vytvořit záznam'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DevelopmentForm;