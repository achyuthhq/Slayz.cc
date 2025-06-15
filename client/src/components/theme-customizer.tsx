import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ThemeLayout, ThemeColors } from "@/components/theme-provider";

export function ThemeCustomizer() {
  const { theme, setTheme, setColors, setLayout } = useTheme();

  const layouts: { value: ThemeLayout; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "minimal", label: "Minimal" },
    { value: "professional", label: "Professional" },
    { value: "creative", label: "Creative" },
  ];

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors({ [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Base Theme</Label>
        <Select
          value={theme.base}
          onValueChange={(value: "light" | "dark" | "system") =>
            setTheme({ ...theme, base: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select base theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Layout</Label>
        <Select
          value={theme.layout}
          onValueChange={(value: ThemeLayout) => setLayout(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            {layouts.map((layout) => (
              <SelectItem key={layout.value} value={layout.value}>
                {layout.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Custom Colors</Label>
        <div className="grid gap-2">
          {Object.entries(theme.colors || {}).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Label className="w-24">{key}</Label>
              <Input
                type="color"
                value={value}
                onChange={(e) =>
                  handleColorChange(key as keyof ThemeColors, e.target.value)
                }
                className="h-8 w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() =>
          setTheme({
            ...theme,
            colors: undefined,
            layout: "default",
          })
        }
      >
        Reset to Default
      </Button>
    </div>
  );
}
