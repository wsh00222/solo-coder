import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'antd';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showError = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [...prev, { id, type: 'error', msg }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, []);

  const showSuccess = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [...prev, { id, type: 'success', msg }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showError, showSuccess }}>
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '80%', maxWidth: 600 }}>
        {alerts.map(a => (
          <Alert
            key={a.id}
            type={a.type}
            message={a.msg}
            showIcon
            closable
            style={{ marginBottom: 8 }}
          />
        ))}
      </div>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
