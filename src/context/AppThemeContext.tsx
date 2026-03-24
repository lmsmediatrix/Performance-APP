import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

export type AppTheme = "light" | "dark";

interface AppThemeContextValue {
  theme: AppTheme;
  isDarkMode: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme: AppTheme = "light";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      theme,
      isDarkMode: false,
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    [theme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
