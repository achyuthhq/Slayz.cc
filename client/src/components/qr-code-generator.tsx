import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import { toPng } from 'html-to-image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Download, Settings, RefreshCw, Share, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  profileUrl: string;
  userName: string;
  profileImage?: string | null;
}

export function QRCodeGenerator({ profileUrl, userName, profileImage }: QRCodeGeneratorProps) {
  // QR Code customization settings
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(250); // Increased default size
  const [includeImage, setIncludeImage] = useState(true);
  const [imageSize, setImageSize] = useState(50);
  const [borderSize, setBorderSize] = useState(20); // Added default border for quiet zone
  const [qrCodeValue, setQrCodeValue] = useState(profileUrl);
  const [showCustomize, setShowCustomize] = useState(false);

  // Refs for download functionality
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Handle URL update
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrCodeValue(e.target.value);
  };

  // Reset to default URL
  const resetUrl = () => {
    setQrCodeValue(profileUrl);
    toast({
      title: "URL Reset",
      description: "QR code URL has been reset to your profile URL",
    });
  };

  // Download QR code as PNG
  const downloadQRCode = useCallback(() => {
    if (qrCodeRef.current === null) return;

    toPng(qrCodeRef.current, { 
      cacheBust: true,
      quality: 1,
      pixelRatio: 3,
      width: size + (borderSize * 2),
      height: size + (borderSize * 2)
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${userName}-qrcode.png`;
        link.href = dataUrl;
        link.click();

        toast({
          title: "QR Code Downloaded",
          description: "Your QR code has been downloaded successfully",
        });
      })
      .catch((err) => {
        console.error('Error generating QR code image:', err);
        toast({
          title: "Download Failed",
          description: "There was an error downloading your QR code",
          variant: "destructive",
        });
      });
  }, [qrCodeRef, userName, size, borderSize]);

  // Share QR code
  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${userName}'s Profile QR Code`,
          text: `Scan this QR code to visit ${userName}'s profile`,
          url: profileUrl,
        });

        toast({
          title: "Shared Successfully",
          description: "Your QR code has been shared",
        });
      } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(profileUrl);
        toast({
          title: "Copied to Clipboard",
          description: "Profile URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast({
        title: "Share Failed",
        description: "There was an error sharing your QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Profile QR Code
        </CardTitle>
        <CardDescription>
          Generate and customize a QR code for your profile
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 pb-0">
        <div className="flex flex-col items-center">
          {/* QR Code Preview */}
          <div 
            ref={qrCodeRef} 
            className="bg-white rounded-lg shadow-sm mb-4 flex items-center justify-center"
            style={{ 
              padding: `${borderSize}px`,
              backgroundColor: bgColor,
              minWidth: `${size + (borderSize * 2)}px`,
              minHeight: `${size + (borderSize * 2)}px`
            }}
          >
            <QRCodeCanvas
              value={qrCodeValue}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="Q" // Using Q level for better balance between error correction and density
              includeMargin={true}
              imageSettings={includeImage && profileImage ? {
                src: profileImage,
                height: imageSize,
                width: imageSize,
                excavate: true,
              } : undefined}
            />
          </div>

          {/* URL Input */}
          <div className="w-full mb-4">
            <Label htmlFor="qr-url" className="text-sm mb-1 block">
              URL for QR Code
            </Label>
            <div className="flex gap-2">
              <Input
                id="qr-url"
                value={qrCodeValue}
                onChange={handleUrlChange}
                placeholder="Enter URL for QR code"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetUrl}
                title="Reset to default URL"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center mt-4 w-full">
            <Button 
              onClick={downloadQRCode}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 text-white font-medium rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button 
              onClick={shareQRCode} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 text-white font-medium rounded-xl"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button 
              onClick={() => setShowCustomize(!showCustomize)} 
              className="flex-1 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 text-white font-medium rounded-xl"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showCustomize ? "Hide Options" : "Customize"}
            </Button>
          </div>
        </div>

        {/* Customization Options */}
        {showCustomize && (
          <div className="mt-4 pt-4 border-t">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="size">Size & Border</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
              </TabsList>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">QR Code Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 flex items-center justify-between"
                        >
                          <div
                            className="w-6 h-6 rounded-full mr-2"
                            style={{ backgroundColor: fgColor }}
                          />
                          <span>{fgColor}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker color={fgColor} onChange={setFgColor} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Background Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 flex items-center justify-between"
                        >
                          <div
                            className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                            style={{ backgroundColor: bgColor }}
                          />
                          <span>{bgColor}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker color={bgColor} onChange={setBgColor} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              {/* Size Tab */}
              <TabsContent value="size" className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">QR Code Size: {size}px</Label>
                  </div>
                  <Slider
                    value={[size]}
                    min={200}
                    max={400}
                    step={10}
                    onValueChange={(value) => setSize(value[0])}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">Border Size: {borderSize}px</Label>
                  </div>
                  <Slider
                    value={[borderSize]}
                    min={10}
                    max={40}
                    step={5}
                    onValueChange={(value) => setBorderSize(value[0])}
                  />
                </div>
              </TabsContent>

              {/* Logo Tab */}
              <TabsContent value="logo" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-logo"
                    checked={includeImage}
                    onCheckedChange={setIncludeImage}
                  />
                  <Label htmlFor="include-logo" className="text-sm cursor-pointer">
                    Include Profile Image
                  </Label>
                </div>

                {includeImage && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-sm">Logo Size: {imageSize}px</Label>
                    </div>
                    <Slider
                      value={[imageSize]}
                      min={30}
                      max={80}
                      step={5}
                      onValueChange={(value) => setImageSize(value[0])}
                      disabled={!includeImage}
                    />
                  </div>
                )}

                {!profileImage && includeImage && (
                  <div className="text-sm text-orange-500 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Upload a profile image in settings to include it in your QR code
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground py-3">
        Share your profile easily by letting others scan this QR code
      </CardFooter>
    </Card>
  );
}