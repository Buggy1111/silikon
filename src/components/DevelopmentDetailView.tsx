import React from 'react';
import { motion } from 'framer-motion';
import { DevelopmentRecord } from '../types';
import { 
  X, 
  Calendar, 
  Package, 
  User, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Gauge,
  Timer,
  Target,
  Activity,
  Beaker,
  Settings
} from 'lucide-react';

interface DevelopmentDetailViewProps {
  record: DevelopmentRecord;
  onClose: () => void;
}

const DevelopmentDetailView: React.FC<DevelopmentDetailViewProps> = ({ record, onClose }) => {
  // Efektivita hmotnosti: Real/Calc * 100%
  const efficiency = record.productWeightCalc > 0 
    ? (record.productWeightReal / record.productWeightCalc) * 100 
    : 0;

  // Procento odpadů: odpady / (hmotnost vývoje + odpady) * 100%
  const totalMaterial = record.totalDevelopmentWeight + record.wasteVulcanized + record.wasteNonVulcanized;
  const totalWastePercentage = totalMaterial > 0 
    ? ((record.wasteVulcanized + record.wasteNonVulcanized) / totalMaterial) * 100 
    : 0;

  // Efektivita rychlosti: Real/Calc * 100%
  const speedEfficiency = record.lineSpeedCalc > 0 
    ? (record.lineSpeedReal / record.lineSpeedCalc) * 100 
    : 0;

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
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center">
            <Beaker className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">
                Vývojový záznam #{record.recordNumber}
              </h2>
              <p className="text-purple-100">
                {record.date.toLocaleDateString('cs-CZ', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Základní informace o vývoji */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Informace o vývoji
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <label className="text-sm font-medium text-purple-600">Číslo článku</label>
                <p className="text-lg font-semibold text-purple-900">{record.articleNumber || 'Neuvedeno'}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <label className="text-sm font-medium text-indigo-600">Rozměry</label>
                <p className="text-lg font-semibold text-indigo-900">{record.dimensions || 'Neuvedeno'}</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                <label className="text-sm font-medium text-violet-600">Označení hubice</label>
                <p className="text-lg font-semibold text-violet-900">{record.hubiceNumber || 'Neuvedeno'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm font-medium text-blue-600">Zákazník</label>
                <p className="text-lg font-semibold text-blue-900">{record.customer || 'Vývoj'}</p>
              </div>
            </div>
          </section>

          {/* Materiál a Lot */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-500" />
              Materiál a šarže
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="text-sm font-medium text-green-600">Název směsi</label>
                <p className="text-lg font-semibold text-green-900">{record.materialName}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <label className="text-sm font-medium text-emerald-600">Kód dodavatele</label>
                <p className="text-lg font-semibold text-emerald-900">{record.supplierCode}</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <label className="text-sm font-medium text-teal-600">LOT číslo</label>
                <p className="text-lg font-semibold text-teal-900">{record.lotNumber}</p>
              </div>
            </div>
          </section>

          {/* Personál */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-500" />
              Vývojový tým
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <label className="text-sm font-medium text-orange-600">Předák</label>
                <p className="text-lg font-semibold text-orange-900">{record.supervisor}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <label className="text-sm font-medium text-amber-600">Operátor</label>
                <p className="text-lg font-semibold text-amber-900">{record.operator}</p>
              </div>
            </div>
          </section>

          {/* Rychlosti výroby */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Gauge className="w-5 h-5 mr-2 text-blue-500" />
              Rychlosti výroby
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm font-medium text-blue-600">Rychlost Real (m/min)</label>
                <p className="text-xl font-bold text-blue-700">{record.lineSpeedReal}</p>
                <p className="text-xs text-blue-600">metry za minutu</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                <label className="text-sm font-medium text-cyan-600">Rychlost Calc (m/min)</label>
                <p className="text-xl font-bold text-cyan-700">{record.lineSpeedCalc}</p>
                <p className="text-xs text-cyan-600">metry za minutu</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="text-sm font-medium text-green-600">Rychlost Real (m/h)</label>
                <p className="text-xl font-bold text-green-700">{record.lineSpeedRealPerHour}</p>
                <p className="text-xs text-green-600">metry za hodinu</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <label className="text-sm font-medium text-purple-600">Rychlost Calc (m/h)</label>
                <p className="text-xl font-bold text-purple-700">{record.lineSpeedCalcPerHour}</p>
                <p className="text-xs text-purple-600">metry za hodinu</p>
              </div>
            </div>
          </section>

          {/* Výroba a parametry */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-500" />
              Výrobní parametry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <label className="text-sm font-medium text-indigo-600">Výroba</label>
                <p className="text-xl font-bold text-indigo-700">{record.productionQuantity}</p>
                <p className="text-xs text-indigo-600">m/ks</p>
              </div>
            </div>
          </section>

          {/* Váhy výrobků */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-emerald-500" />
              Váhové parametry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <label className="text-sm font-medium text-emerald-600">Váha Real</label>
                <p className="text-xl font-bold text-emerald-700">{record.productWeightReal.toFixed(3)}</p>
                <p className="text-xs text-emerald-600">kg/m</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="text-sm font-medium text-green-600">Váha Calc</label>
                <p className="text-xl font-bold text-green-700">{record.productWeightCalc.toFixed(3)}</p>
                <p className="text-xs text-green-600">kg/m</p>
              </div>
              <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
                <label className="text-sm font-medium text-lime-600">Hmotnost vývoje</label>
                <p className="text-xl font-bold text-lime-700">{record.totalDevelopmentWeight.toFixed(1)}</p>
                <p className="text-xs text-lime-600">kg</p>
              </div>
            </div>
          </section>

          {/* Analýza odpadů */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Analýza odpadů z vývoje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <label className="text-sm font-medium text-red-600">Vulkanizovaný odpad</label>
                <p className="text-xl font-bold text-red-700">{record.wasteVulcanized.toFixed(1)} kg</p>
                <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((record.wasteVulcanized / Math.max(record.totalDevelopmentWeight, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <label className="text-sm font-medium text-orange-600">Nevulkanizovaný odpad</label>
                <p className="text-xl font-bold text-orange-700">{record.wasteNonVulcanized.toFixed(1)} kg</p>
                <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((record.wasteNonVulcanized / Math.max(record.totalDevelopmentWeight, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-sm font-medium text-gray-600">Celkový odpad</label>
                <p className="text-xl font-bold text-gray-700">{(record.wasteVulcanized + record.wasteNonVulcanized).toFixed(1)} kg</p>
                <p className="text-sm text-gray-600">{totalWastePercentage.toFixed(2)}%</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(totalWastePercentage * 2, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Časová analýza */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Timer className="w-5 h-5 mr-2 text-indigo-500" />
              Časová analýza vývoje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <label className="text-sm font-medium text-indigo-600">Čas začátku</label>
                <p className="text-lg font-bold text-indigo-700">
                  {record.startTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                <label className="text-sm font-medium text-violet-600">Čas konce</label>
                <p className="text-lg font-bold text-violet-700">
                  {record.endTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <label className="text-sm font-medium text-purple-600">Celkový čas vývoje</label>
                <p className="text-lg font-bold text-purple-700">{record.totalTime.toFixed(2)} h</p>
              </div>
            </div>
          </section>

          {/* KPI a výkonnost vývoje */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-500" />
              Vývojové ukazatele
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <label className="text-sm font-medium text-green-600">Efektivita hmotnosti</label>
                <p className="text-2xl font-bold text-green-700">{efficiency.toFixed(1)}%</p>
                <div className="mt-2 w-full bg-green-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${efficiency >= 90 ? 'bg-green-500' : efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(efficiency, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm font-medium text-blue-600">Efektivita rychlosti</label>
                <p className="text-2xl font-bold text-blue-700">{speedEfficiency.toFixed(1)}%</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${speedEfficiency >= 90 ? 'bg-green-500' : speedEfficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(speedEfficiency, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <label className="text-sm font-medium text-purple-600">Úspěšnost vývoje</label>
                <p className="text-2xl font-bold text-purple-700">
                  {record.totalDevelopmentWeight > 0 ? 'Úspěšný' : 'Probíhá'}
                </p>
                <p className="text-sm text-purple-600">
                  {record.totalDevelopmentWeight.toFixed(1)} kg materiálu
                </p>
              </div>
            </div>
          </section>

          {/* Poznámky k vývoji */}
          {record.notes && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Poznámky k vývoji
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DevelopmentDetailView;