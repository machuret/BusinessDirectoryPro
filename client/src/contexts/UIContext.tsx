import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface UIContextType {
  // Theme management
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Global loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Global preferences
  preferences: {
    compactMode: boolean;
    showImages: boolean;
    defaultPageSize: number;
  };
  updatePreferences: (prefs: Partial<UIContextType["preferences"]>) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    compactMode: false,
    showImages: true,
    defaultPageSize: 10,
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Always default to light theme unless explicitly saved
      setThemeState("light");
    }
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("ui-preferences");
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...preferences, ...parsed });
      } catch (error) {
        console.warn("Failed to parse saved preferences:", error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    // Force remove dark class and ensure light theme
    root.classList.remove("dark");
    if (theme === "dark") {
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("ui-preferences", JSON.stringify(preferences));
  }, [preferences]);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === "light" ? "dark" : "light");
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const updatePreferences = (newPrefs: Partial<UIContextType["preferences"]>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  const value: UIContextType = {
    theme,
    setTheme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    globalLoading,
    setGlobalLoading,
    preferences,
    updatePreferences,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}