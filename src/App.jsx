import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomeScreen from './components/views/home/Home';
import ValidationScreen from './components/views/validation/Validation';
import StatisticsScreen from './components/views/statistic/Statistics';
import LogsScreen from './components/views/logs/Logs';
import Sidebar from './components/sidebar/Sidebar';
import Modal from './components/modal/Modal';
import PlatIllegalScreen from './components/views/platilegal/PlatIllegal';
import MembershipScreen from './components/views/membership/Membership';
import LiveStreamCard from './components/views/camera/camera';

const AppContent = () => {
  const location = useLocation();

  const getCurrentTab = () => {
    const path = location.pathname;
    switch(path) {
      case '/': return 'home';
      case '/membership-list': return 'membership-list';
      case '/plat-illegal': return 'plat-illegal';
      case '/validation': return 'validation';
      case '/statistics': return 'statistics';
      case '/logs': return 'logs';
      default: return 'home';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="flex">
        <Sidebar activeTab={getCurrentTab()} />
        
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/membership-list" element={<MembershipScreen />} />
            <Route path="/plat-illegal" element={<PlatIllegalScreen />} />
            <Route path="/validation" element={<ValidationScreen />} />
            <Route path="/statistics" element={<StatisticsScreen />} />
            <Route path="/logs" element={<LogsScreen />} />
            <Route path="/camera" element={<LiveStreamCard />} />
          </Routes>
        </div>
      </div>

      
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;