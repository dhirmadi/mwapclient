import React, { useState } from 'react';
import { useAuth } from '../core/context/AuthContext';
import { testNetworkConnectivity } from '../shared/utils/api';

interface DebugPanelProps {
  isVisible?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false }) => {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [isTestingNetwork, setIsTestingNetwork] = useState(false);
  const auth = useAuth();

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const handleNetworkTest = async () => {
    setIsTestingNetwork(true);
    try {
      await testNetworkConnectivity();
    } catch (error) {
      console.error('Network test failed:', error);
    } finally {
      setIsTestingNetwork(false);
    }
  };

  const debugInfo = {
    auth: {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      isReady: auth.isReady,
      hasUser: !!auth.user,
      userId: auth.user?.sub,
      userEmail: auth.user?.email,
      isSuperAdmin: auth.isSuperAdmin,
      isTenantOwner: auth.isTenantOwner,
      hasRoles: !!auth.roles,
      projectRoles: auth.roles?.projectRoles?.length || 0,
    },
    localStorage: {
      hasAuthToken: !!localStorage.getItem('auth_token'),
      tokenLength: localStorage.getItem('auth_token')?.length || 0,
    },
    environment: {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      baseUrl: import.meta.env.BASE_URL,
    }
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        border: '1px solid #333'
      }} onClick={() => setIsOpen(true)}>
        🐛 Debug
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      border: '1px solid #333',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🐛 Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>🔐 Authentication</h4>
        <pre style={{ margin: 0, fontSize: '11px', lineHeight: '1.4' }}>
          {JSON.stringify(debugInfo.auth, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#2196F3' }}>💾 Local Storage</h4>
        <pre style={{ margin: 0, fontSize: '11px', lineHeight: '1.4' }}>
          {JSON.stringify(debugInfo.localStorage, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#FF9800' }}>🌍 Environment</h4>
        <pre style={{ margin: 0, fontSize: '11px', lineHeight: '1.4' }}>
          {JSON.stringify(debugInfo.environment, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#9C27B0' }}>🛠️ Actions</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleNetworkTest}
            disabled={isTestingNetwork}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: isTestingNetwork ? 'not-allowed' : 'pointer',
              fontSize: '11px'
            }}
          >
            {isTestingNetwork ? '🔄 Testing...' : '🌐 Test Network'}
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.reload();
            }}
            style={{
              backgroundColor: '#d32f2f',
              color: 'white',
              border: '1px solid #f44336',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🗑️ Clear Token
          </button>
          
          <button
            onClick={() => {
              console.clear();
              console.log('🧹 Console cleared');
            }}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🧹 Clear Console
          </button>
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#888', marginTop: '12px' }}>
        💡 Check browser console for detailed API logs
      </div>
    </div>
  );
};

export default DebugPanel;