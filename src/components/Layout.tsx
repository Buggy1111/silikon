import React, { useState } from 'react';
import { useAppStore } from '../stores/simpleStore';
import { sampleData } from '../data/sampleData';
import { 
  Home, 
  Factory, 
  Package, 
  Recycle, 
  FileText, 
  Upload, 
  Download,
  Menu,
  X,
  Settings,
  BarChart3,
  Database,
  LogOut,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, setCurrentView, setData, user, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' as const },
    { name: 'Výroba', icon: Factory, view: 'production' as const },
    { name: 'Vývoj', icon: Settings, view: 'development' as const },
    { name: 'Sklad', icon: Package, view: 'inventory' as const },
    { name: 'Odpady', icon: Recycle, view: 'waste' as const },
    { name: 'Požadavky', icon: FileText, view: 'requirements' as const },
    { name: 'Analýzy', icon: BarChart3, view: 'analytics' as const }
  ];

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Import logic would go here
        console.log('Importing file:', file.name);
      }
    };
    input.click();
  };

  const handleExportExcel = () => {
    // Export logic would go here
    console.log('Exporting data...');
  };

  const handleLoadSampleData = () => {
    setData(sampleData);
    alert('Ukázková data byla načtena!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">VMQ Výroba</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentView(item.view);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                currentView === item.view
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="space-y-2">
            <button
              onClick={handleLoadSampleData}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Ukázková data
            </button>
            <button
              onClick={handleImportExcel}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Desktop header */}
        <div className="hidden lg:block bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">VMQ Výrobní Systém</h1>
            
            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-blue-50 rounded-full px-4 py-2">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {user?.username}
                </span>
                <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-2 py-1 rounded-full">
                  Admin
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-full transition-colors"
                title="Odhlásit se"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Odhlásit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">VMQ Výroba</h1>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700"
              title="Odhlásit se"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;