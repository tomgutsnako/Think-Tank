import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { CloudOff, Cloud } from 'lucide-react';
import { storage } from '../utils/storage';

export function OfflineToggle() {
  const [offline, setOffline] = useState<boolean>(storage.getOfflineMode());

  useEffect(() => {
    // Listen for storage changes in other tabs
    const handler = (e: StorageEvent) => {
      if (e.key === 'thinktank_offline_mode') {
        setOffline(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateSW = (enabled: boolean) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SET_OFFLINE_MODE', enabled });
    }
  };

  const toggle = () => {
    const next = !offline;
    setOffline(next);
    storage.setOfflineMode(next);
    updateSW(next);
    // notify other windows
    try { window.dispatchEvent(new StorageEvent('storage', { key: 'thinktank_offline_mode', newValue: next ? 'true' : 'false' })); } catch (e) {}
  };

  return (
    <Button variant={offline ? 'destructive' : 'outline'} onClick={toggle} title={offline ? 'App is in Offline Mode' : 'App is Online'}>
      {offline ? <CloudOff className="w-4 h-4 mr-2" /> : <Cloud className="w-4 h-4 mr-2" />} 
      {offline ? 'Offline Mode' : 'Online Mode'}
    </Button>
  );
}

export default OfflineToggle;