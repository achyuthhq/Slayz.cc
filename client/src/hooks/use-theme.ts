import { useContext } from "react";
import {
  ThemeProviderContext,
  type Theme,
  type ThemeColors,
  type ThemeLayout,
} from "@/components/theme-provider";

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}

export type { Theme, ThemeColors, ThemeLayout };