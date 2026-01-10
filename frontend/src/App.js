import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Restaurants from './pages/Restaurants/Restaurants';
import Inventory from './pages/Inventory/Inventory';
import Recipes from './pages/Recipes/Recipes';
import ChainManagement from './pages/Chains/ChainManagement';
import GastronomyTools from './pages/Gastronomy/GastronomyTools';
import AICopilotPage from './pages/AI/AICopilotPage';
import OrdersPage from './pages/Orders/OrdersPage';
import EnterprisePage from './pages/Enterprise/EnterprisePage';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Standard Features
import IoTDashboard from './pages/Premium/IoTDashboard';
import AdvancedFinance from './pages/Finance/AdvancedFinance';

// Import i18n configuration
import './i18n';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/ai-copilot" element={<AICopilotPage />} />
        <Route path="/iot-dashboard" element={<IoTDashboard />} />
        <Route path="/advanced-finance" element={<AdvancedFinance />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        
        {/* Routes spécialisées selon le type de restaurant */}
        {user.restaurant?.type === 'chain' && (
          <Route path="/chains" element={<ChainManagement />} />
        )}
        
        {user.restaurant?.type === 'gastronomy' && (
          <Route path="/gastronomy" element={<GastronomyTools />} />
        )}
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;