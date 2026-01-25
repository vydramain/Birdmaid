import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type PlatformType = "desktop" | "mobile";

type PlatformContextType = {
  platform: PlatformType;
  isMobile: boolean;
  isDesktop: boolean;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children, initialPlatform }: { children: ReactNode; initialPlatform?: PlatformType }) {
  const [platform, setPlatform] = useState<PlatformType>(initialPlatform || "desktop");

  useEffect(() => {
    if (initialPlatform) return; // Skip auto-detection if explicit platform provided (testing)

    // 1. Check Query Param (Force Mode)
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "mobile" || mode === "desktop") {
      setPlatform(mode);
      return;
    }

    // 2. Check LocalStorage
    const stored = localStorage.getItem("birdmaid_platform");
    if (stored === "mobile" || stored === "desktop") {
      setPlatform(stored);
      return;
    }

    // 3. Check Viewport
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setPlatform("mobile");
      } else {
        setPlatform("desktop");
      }
    };

    checkWidth();
    // Note: We deliberately DO NOT listen to resize to prevent layout thrashing.
    // Platform is determined on boot.
  }, []);

  return (
    <PlatformContext.Provider 
      value={{ 
        platform, 
        isMobile: platform === "mobile", 
        isDesktop: platform === "desktop" 
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within PlatformProvider");
  }
  return context;
}
