"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "@/app/dashboard/seeker/seeker.module.css";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function SeekerThemeProvider({ initialTheme, children, cookieName = "seeker-theme" }: { initialTheme: Theme; children: React.ReactNode; cookieName?: string }) {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    // Portalled job details also receive the active workspace palette.
    document.documentElement.dataset.seekerTheme = theme;
    return () => { delete document.documentElement.dataset.seekerTheme; };
  }, [theme]);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.cookie = `${cookieName}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setTheme(next);
  }
  return <ThemeContext.Provider value={{ theme, toggle }}><div data-seeker-theme={theme}>{children}</div></ThemeContext.Provider>;
}

export default function SeekerThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) return null;
  const { theme, toggle } = context;
  return <button type="button" className={styles.themeToggle} onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    <span data-active={theme === "light"}><Sun size={15} /><span>Light</span></span>
    <span data-active={theme === "dark"}><Moon size={15} /><span>Dark</span></span>
  </button>;
}
