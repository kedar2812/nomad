import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerCheckIn from './pages/CustomerCheckIn';
import { OfflineProvider } from './context/OfflineContext';

function App() {
  return (
    <OfflineProvider>
      <BrowserRouter>
        <Routes>
          {/* Staff Dashboard Route */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />

          {/* Customer Self-Checkin Route */}
          <Route path="/checkin" element={<CustomerCheckIn />} />
        </Routes>
      </BrowserRouter>
    </OfflineProvider>
  );
}

export default App;
