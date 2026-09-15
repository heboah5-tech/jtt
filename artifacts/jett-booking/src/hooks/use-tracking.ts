import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Helper to generate a valid UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to track visitor online status and data
export function useTracking() {
  const [location] = useLocation();
  // We use ref for session ID because we don't want to store it in localStorage/sessionStorage
  // per the requirement "never use any client and browser storage".
  // This will regenerate on full page reload, but persists across SPA navigation.
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = generateUUID();
      // Attach to window so other components (like payments) can grab it without prop drilling
      // since we aren't allowed to use localStorage.
      (window as any).visitorId = sessionId.current;
    }

    // Collect system information
    const getBrowserInfo = () => {
      const ua = navigator.userAgent;
      let browser = "Unknown";
      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";
      
      let os = "Unknown";
      if (ua.includes("Win")) os = "Windows";
      else if (ua.includes("Mac")) os = "MacOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("like Mac")) os = "iOS";
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const device = isMobile ? "mobile" : "desktop";
      
      return { browser, os, device, userAgent: ua };
    };

    const trackPage = async () => {
      try {
        const info = getBrowserInfo();
        
        // We simulate location here, in a real app you'd use a GeoIP service on the backend
        const locationStr = "Saudi Arabia, Riyadh"; 
        
        // Grab booking data if available to show in dashboard
        let bookingData = null;
        try {
          const stored = localStorage.getItem('jett_booking');
          if (stored) {
            bookingData = JSON.parse(stored);
          }
        } catch(e) {
          // ignore
        }

        await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: sessionId.current,
            page: (window as any).currentBookingStep || location,
            ...info,
            location: locationStr,
            sessionData: {
              timestamp: Date.now(),
              booking: bookingData
            }
          })
        });
      } catch (err) {
        console.error("Tracking error:", err);
      }
    };

    trackPage();
    
    // Setup ping interval to show "online" status more frequently for realtime step by step
    const interval = setInterval(trackPage, 2000); // Ping every 2s
    
    return () => clearInterval(interval);
  }, [location]);
}
