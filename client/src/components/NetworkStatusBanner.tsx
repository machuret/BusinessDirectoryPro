import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

export function NetworkStatusBanner() {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner for offline or slow connections
    if (!isOnline || isSlowConnection) {
      setShowBanner(true);
      setIsDismissed(false);
    } else {
      // Auto-hide when connection improves
      setShowBanner(false);
    }
  }, [isOnline, isSlowConnection]);

  // Don't show if dismissed or if connection is good
  if (!showBanner || isDismissed || (isOnline && !isSlowConnection)) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
  };

  if (!isOnline) {
    return (
      <Alert className="border-orange-200 bg-orange-50 text-orange-800 rounded-none border-b">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>
            You are currently offline. Some features may be unavailable until your connection is restored.
          </span>
          <button
            onClick={handleDismiss}
            className="text-orange-600 hover:text-orange-800 ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isSlowConnection) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 rounded-none border-b">
        <Wifi className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>
            Your internet connection appears to be slow. Some features may take longer to load.
          </span>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}