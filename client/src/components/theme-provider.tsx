import { createContext, useEffect, useState } from "react";

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

export type ThemeLayout = "default" | "minimal" | "professional" | "creative";

export type Theme = {
  base: "dark" | "light" | "system";
  colors?: ThemeColors;
  layout?: ThemeLayout;
  fonts?: {
    heading?: string;
    body?: string;
  };
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  setLayout: (layout: ThemeLayout) => void;
};

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

const defaultThemeColors: ThemeColors = {
  primary: "#6366f1",
  secondary: "#4f46e5",
  accent: "#818cf8",
  background: "#ffffff",
  text: "#000000",
};

export function ThemeProvider({
  children,
  defaultTheme = { base: "system", colors: defaultThemeColors, layout: "default" },
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // Handle migration from old format (string) to new format (object)
      if (saved === "dark" || saved === "light" || saved === "system") {
        const migratedTheme = { 
          ...defaultTheme,
          base: saved as "dark" | "light" | "system"
        };
        localStorage.setItem(storageKey, JSON.stringify(migratedTheme));
        return migratedTheme;
      }
      return saved ? JSON.parse(saved) : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Function to apply theme
    const applyTheme = (isDark: boolean) => {
      root.classList.remove("light", "dark");
      root.classList.add(isDark ? "dark" : "light");
    };

    // Handle system theme changes
    if (theme.base === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      applyTheme(theme.base === "dark");
    }

    // Apply custom colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    }

    // Apply layout class
    if (theme.layout) {
      root.setAttribute('data-layout', theme.layout);
    }

    // Apply custom fonts
    if (theme.fonts) {
      if (theme.fonts.heading) {
        root.style.setProperty('--font-heading', theme.fonts.heading);
      }
      if (theme.fonts.body) {
        root.style.setProperty('--font-body', theme.fonts.body);
      }
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, JSON.stringify(newTheme));
      setTheme(newTheme);
    },
    setColors: (colors: Partial<ThemeColors>) => {
      const newTheme = {
        ...theme,
        colors: { ...theme.colors, ...colors },
      };
      localStorage.setItem(storageKey, JSON.stringify(newTheme));
      setTheme(newTheme);
    },
    setLayout: (layout: ThemeLayout) => {
      const newTheme = { ...theme, layout };
      localStorage.setItem(storageKey, JSON.stringify(newTheme));
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}