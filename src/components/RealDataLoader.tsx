import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/simpleStore';
import { FileSpreadsheet, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const RealDataLoader: React.FC = () => {
  const { loadRealData, isLoading, error, materials, production, development, inventory, waste } = useAppStore();
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const handleLoadData = async () => {
    try {
      await loadRealData();
      setHasLoadedData(true);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    }
  };

  // Automaticky načíst data při prvním zobrazení komponenty (pokud ještě nejsou načtená)
  useEffect(() => {
    if (!hasLoadedData && materials.length === 0 && production.length === 0) {
      handleLoadData();
    }
  }, []);

  const dataStats = {
    materials: materials.length,
    production: production.length,
    development: development.length,
    inventory: inventory.length,
    waste: waste.length
  };

  const hasData = dataStats.materials > 0 || dataStats.production > 0 || dataStats.development > 0 || dataStats.inventory > 0 || dataStats.waste > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-blue-100">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Skutečná VMQ Data</h3>
            <p className="text-gray-600">Import z Excel souborů VMQ_Ztráty_Extruze_2025.xls a VMQ_Sklad_materiálu_2025.xls</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center space-x-2 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Načítám data...</span>
          </div>
        ) : hasData ? (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Data načtena</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadData}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Načíst Excel Data</span>
          </motion.button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-100 border border-red-300 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Chyba při načítání dat</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
            <p className="text-3xl font-bold text-blue-700">{dataStats.materials}</p>
            <p className="text-sm text-gray-600">Materiály</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
            <p className="text-3xl font-bold text-green-700">{dataStats.production}</p>
            <p className="text-sm text-gray-600">Výrobní záznamy</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-200">
            <p className="text-3xl font-bold text-cyan-700">{dataStats.development}</p>
            <p className="text-sm text-gray-600">Vývojové záznamy</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
            <p className="text-3xl font-bold text-purple-700">{dataStats.inventory}</p>
            <p className="text-sm text-gray-600">Skladové záznamy</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
            <p className="text-3xl font-bold text-orange-700">{dataStats.waste}</p>
            <p className="text-sm text-gray-600">Odpady</p>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-3"
        >
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
          <p className="text-center text-gray-300 text-sm">
            Parsování Excel souborů a import dat do aplikace...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RealDataLoader;