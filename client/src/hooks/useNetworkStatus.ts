import { useState, useEffect } from "react";

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  downlinkSpeed: number | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [downlinkSpeed, setDownlinkSpeed] = useState<number | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const speed = connection?.downlink || null;
        setDownlinkSpeed(speed);
        
        // Consider connection slow if downlink is less than 1 Mbps
        setIsSlowConnection(speed !== null && speed < 1);
      }
    };

    // Initial check
    updateConnectionStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Monitor connection changes if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', updateConnectionStatus);
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        connection?.removeEventListener('change', updateConnectionStatus);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return {
    isOnline,
    isSlowConnection,
    downlinkSpeed,
  };
}