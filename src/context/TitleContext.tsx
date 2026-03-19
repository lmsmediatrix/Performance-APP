import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageTitles, formatPageTitle } from "../config/pageTitles";

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const TitleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = useState<string>("");
  const location = useLocation();

  // Update title when route changes
  useEffect(() => {
    // Set initial loading state
    if (location.pathname === "/" && !pageTitles[location.pathname]) {
      const loadingTitle = pageTitles["loading"] as string;
      setTitle(loadingTitle);
      document.title = formatPageTitle(loadingTitle);
      return;
    }

    // First try exact match
    if (pageTitles[location.pathname]) {
      const titleValue = pageTitles[location.pathname];
      const newTitle =
        typeof titleValue === "function"
          ? titleValue()
          : (titleValue as string);
      setTitle(newTitle);
      document.title = formatPageTitle(newTitle);
      return;
    }

    // Try to match patterns with parameters
    const routePatterns = Object.keys(pageTitles);

    for (const pattern of routePatterns) {
      if (!pattern.includes(":")) continue;

      const regexPattern = pattern
        .replace(/:[^/]+/g, "([^/]+)")
        .replace(/\//g, "\\/");

      const regex = new RegExp(`^${regexPattern}$`);

      if (regex.test(location.pathname)) {
        const titleValue = pageTitles[pattern];
        const newTitle =
          typeof titleValue === "function"
            ? titleValue()
            : (titleValue as string);
        setTitle(newTitle);
        document.title = formatPageTitle(newTitle);
        return;
      }
    }

    // Default title
    const defaultTitle = (pageTitles["*"] as string) || "Page";
    setTitle(defaultTitle);
    document.title = formatPageTitle(defaultTitle);
  }, [location.pathname]);

  // Custom setter that also updates document title
  const setPageTitle = (newTitle: string) => {
    setTitle(newTitle);
    document.title = formatPageTitle(newTitle);
  };

  return (
    <TitleContext.Provider value={{ title, setTitle: setPageTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = (): TitleContextType => {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
};
