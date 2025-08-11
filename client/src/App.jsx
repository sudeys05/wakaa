import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CollapsibleSidebar from './components/Sidebar/CollapsibleSidebar';
import EnhancedProfile from './components/Profile/EnhancedProfile';
import CasesManager from './components/Cases/CasesManager';
import Dashboard from './components/Dashboard/Dashboard';
import Cases from './components/Cases/Cases';
import OccurrenceBook from './components/OccurrenceBook/OccurrenceBook';
import LicensePlates from './components/LicensePlates/LicensePlates';
import Evidence from './components/Evidence/Evidence';
import Geofiles from './components/Geofiles/Geofiles';
import Reports from './components/Reports/Reports';
import Profile from './components/Profile/Profile';
import UserManagement from './components/UserManagement/UserManagement';
import AddCaseModal from './components/AddCaseModal/AddCaseModal';
import AddOBModal from './components/AddOBModal/AddOBModal';
import LicensePlateModal from './components/LicensePlateModal/LicensePlateModal';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import ForgotPasswordModal from './components/Auth/ForgotPasswordModal';
import './App.css';

const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
  const [isAddOBModalOpen, setIsAddOBModalOpen] = useState(false);
  const [isLicensePlateModalOpen, setIsLicensePlateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [cases, setCases] = useState([]);

  const [licensePlates, setLicensePlates] = useState([
    {
      id: 'LP-1',
      plateNumber: 'ABC123',
      ownerName: 'John Smith',
      fatherName: 'Robert Smith',
      motherName: 'Mary Smith',
      idNumber: 'ID123456789',
      passportNumber: 'P987654321',
      ownerImage: null,
      dateAdded: '2025-01-15'
    }
  ]);

  const [obEntries, setOBEntries] = useState([
    {
      id: 'OB-2024-001',
      obNumber: 'OB/2024/0001',
      dateTime: '2025-01-15 14:30',
      type: 'Incident',
      description: 'Traffic accident at Main Street intersection',
      reportedBy: 'John Doe',
      recordingOfficer: 'Officer Smith',
      location: 'Main Street & 5th Ave',
      status: 'Under Investigation'
    }
  ]);

  const handleAddCase = (newCase) => {
    setCases(prev => [newCase, ...prev]);
  };

  const handleUpdateCase = (updatedCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? { ...updatedCase, lastUpdate: new Date().toISOString().split('T')[0] } : c));
  };

  const handleDeleteCase = (caseId) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const handleAddOB = (newOBEntry) => {
    setOBEntries(prev => [newOBEntry, ...prev]);
  };

  const handleUpdateOB = (updatedOB) => {
    setOBEntries(prev => prev.map(ob => ob.id === updatedOB.id ? updatedOB : ob));
  };

  const handleDeleteOB = (obId) => {
    setOBEntries(prev => prev.filter(ob => ob.id !== obId));
  };

  const handleAddPlate = (newPlate) => {
    setLicensePlates(prev => [newPlate, ...prev]);
  };

  const handleAddCaseClick = () => {
    setIsAddCaseModalOpen(true);
  };

  const handleAddOBClick = () => {
    setIsAddOBModalOpen(true);
  };

  const handleLicensePlateClick = () => {
    setIsLicensePlateModalOpen(true);
  };

  // Authentication modal handlers
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onAddCaseClick={handleAddCaseClick} onLicensePlateClick={handleLicensePlateClick} cases={cases} setActiveSection={setActiveSection} />;
      case 'cases':
        return <CasesManager />;
      case 'occurrence-book':
        return <OccurrenceBook onAddOBClick={handleAddOBClick} obEntries={obEntries} onUpdateOB={handleUpdateOB} onDeleteOB={handleDeleteOB} />;
      case 'license-plates':
        return <LicensePlates />;
      case 'evidence':
        return <Evidence />;
      case 'geofiles':
        return <Geofiles />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <EnhancedProfile />;
      case 'admin':
        return user?.role === 'admin' ? <UserManagement onRegisterClick={handleRegisterClick} /> : (
          <div style={{ padding: '30px', color: '#ffffff' }}>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this section.</p>
          </div>
        );
      case 'message':
      case 'media':
      case 'updates':
      case 'entry':
        return (
          <div style={{ padding: '30px', color: '#ffffff' }}>
            <h1 style={{ textTransform: 'capitalize' }}>{activeSection}</h1>
            <p>This section is coming soon...</p>
          </div>
        );
      default:
        return <Dashboard onAddCaseClick={handleAddCaseClick} onLicensePlateClick={handleLicensePlateClick} cases={cases} setActiveSection={setActiveSection} />;
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Police System...</h2>
          <p>Authenticating user session</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-content">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-badge">🛡️</div>
              <h1>Police Management System</h1>
              <p>Secure Access Portal</p>
            </div>
          </div>
          
          <div className="login-form">
            <button 
              className="login-btn" 
              onClick={() => setIsLoginModalOpen(true)}
            >
              Sign In to Continue
            </button>
            <p className="login-help">
              Use your assigned username and password to access the system.
            </p>
            <p className="default-credentials">
              <strong>Default Admin:</strong> admin / admin123
            </p>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    );
  }

  // Main authenticated app
  return (
    <div className="app">
      <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="main-content">
        {renderContent()}
      </div>
      
      <AddCaseModal 
        isOpen={isAddCaseModalOpen}
        onClose={() => setIsAddCaseModalOpen(false)}
        onAddCase={handleAddCase}
      />
      <AddOBModal 
        isOpen={isAddOBModalOpen}
        onClose={() => setIsAddOBModalOpen(false)}
        onAddOB={handleAddOB}
      />
      <LicensePlateModal 
        isOpen={isLicensePlateModalOpen}
        onClose={() => setIsLicensePlateModalOpen(false)}
        onAddPlate={handleAddPlate}
        onSearchPlate={() => {}}
        plates={licensePlates}
      />

      {user?.role === 'admin' && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;