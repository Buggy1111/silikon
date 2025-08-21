import React from 'react';
import { useAppStore } from './stores/simpleStore';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Production from './components/Production';
import Development from './components/Development';
import Inventory from './components/Inventory';
import Waste from './components/Waste';

function App() {
  const { currentView, user } = useAppStore();

  // Pokud není přihlášen, zobraz login
  if (!user?.isAuthenticated) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'production':
        return <Production />;
      case 'development':
        return <Development />;
      case 'inventory':
        return <Inventory />;
      case 'waste':
        return <Waste />;
      case 'requirements':
        return <div className="p-6"><h1 className="text-2xl font-bold">Požadavky - v přípravě</h1></div>;
      case 'analytics':
        return <div className="p-6"><h1 className="text-2xl font-bold">Analýzy - v přípravě</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
}

export default App
