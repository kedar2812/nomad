import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CustomerCheckIn from './pages/CustomerCheckIn';
import CommandPalette from './components/CommandPalette';
import CheckInModal from './components/CheckInModal';
import { OfflineProvider } from './context/OfflineContext';

function AppContent() {
  const navigate = useNavigate();
  const [commandPaletteTable, setCommandPaletteTable] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Handle actions from command palette
  const handleTableAction = (action, table) => {
    if (action === 'checkin') {
      setCommandPaletteTable(table);
      setIsCheckInOpen(true);
    }
  };

  return (
    <>
      <CommandPalette onTableAction={handleTableAction} />

      <Routes>
        {/* Staff Dashboard Route */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />

        {/* Settings Route */}
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />

        {/* Customer Self-Checkin Route */}
        <Route path="/checkin" element={<CustomerCheckIn />} />
      </Routes>

      {/* Modal triggered from Command Palette */}
      {commandPaletteTable && (
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => { setIsCheckInOpen(false); setCommandPaletteTable(null); }}
          table={commandPaletteTable}
        />
      )}
    </>
  );
}

function App() {
  return (
    <OfflineProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </OfflineProvider>
  );
}

export default App;
