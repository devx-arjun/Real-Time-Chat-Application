import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("linkup-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "light";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
    localStorage.setItem("linkup-theme", nextTheme);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
