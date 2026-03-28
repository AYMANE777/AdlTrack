"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }

    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (savedCollapsed === "true") {
      setIsCollapsed(true);
    } else if (savedCollapsed === "false") {
      setIsCollapsed(false);
    }
  }, []);

  const handleSetIsCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem("sidebar_collapsed", val.toString());
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newValue;
    });
  };

  return (
    <LayoutContext.Provider
      value={{ isCollapsed, setIsCollapsed: handleSetIsCollapsed, isDarkMode, toggleDarkMode }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
