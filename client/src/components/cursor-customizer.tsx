import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Theme } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CursorCustomizer() {
  const { theme, setTheme } = useTheme();
  const [cursorUrl, setCursorUrl] = useState(theme.cursor?.value || "");

  const handleCursorEnable = (enabled: boolean) => {
    const newTheme = {
      ...theme,
      cursor: {
        ...(theme.cursor || { type: "custom", value: "", size: 32 }),
        enabled,
      },
    };
    setTheme(newTheme);
  };

  const handleCursorUpload = (url: string) => {
    const newTheme = {
      ...theme,
      cursor: {
        ...(theme.cursor || { size: 32 }),
        enabled: true,
        type: "custom",
        value: url,
      },
    };
    setTheme(newTheme);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTheme = {
      ...theme,
      cursor: {
        ...(theme.cursor || { size: 32 }),
        enabled: true,
        type: "url",
        value: cursorUrl,
      },
    };
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="cursor-enable">Enable Custom Cursor</Label>
        <Switch
          id="cursor-enable"
          checked={theme.cursor?.enabled || false}
          onCheckedChange={handleCursorEnable}
        />
      </div>

      {theme.cursor?.enabled && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Cursor</TabsTrigger>
            <TabsTrigger value="url">Cursor URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUploader
              type="cursor"
              onUploadComplete={handleCursorUpload}
            />
            <p className="text-sm text-muted-foreground">
              Upload a .cur, .ani, .ico, .png, .gif, or .svg file (32x32px recommended)
            </p>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cursor-url">Cursor URL</Label>
                <Input
                  id="cursor-url"
                  placeholder="https://example.com/cursor.png"
                  value={cursorUrl}
                  onChange={(e) => setCursorUrl(e.target.value)}
                />
              </div>
              <Button type="submit">Save URL</Button>
            </form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
