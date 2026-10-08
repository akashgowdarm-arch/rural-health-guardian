import React, { createContext, useContext, useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'slow' | 'offline';

interface NetworkContextType {
  status: NetworkStatus;
  setStatus: (status: NetworkStatus) => void;
  pendingSyncCount: number;
  incrementPendingSync: () => void;
  clearPendingSync: () => void;
  isOnline: boolean;
  triggerSync: () => Promise<void>;
  isSyncing: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<NetworkStatus>('online');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Monitor real browser connectivity as a baseline
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') setStatus('online');
    };
    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status]);

  const incrementPendingSync = () => {
    setPendingSyncCount(prev => prev + 1);
  };

  const clearPendingSync = () => {
    setPendingSyncCount(0);
  };

  const triggerSync = async () => {
    if (pendingSyncCount === 0 || status === 'offline') return;
    setIsSyncing(true);
    // Simulate rural sync network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    setPendingSyncCount(0);
    setIsSyncing(false);
  };

  return (
    <NetworkContext.Provider
      value={{
        status,
        setStatus,
        pendingSyncCount,
        incrementPendingSync,
        clearPendingSync,
        isOnline: status !== 'offline',
        triggerSync,
        isSyncing,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
