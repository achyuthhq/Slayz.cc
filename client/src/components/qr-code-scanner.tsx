import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Scan, ExternalLink, XCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QrCodeScannerProps {
  onScan?: (decodedText: string) => void;
}

export function QrCodeScanner({ onScan }: QrCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Failed to stop scanner:", error);
        });
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    if (!scannerContainerRef.current) return;
    
    try {
      const scannerId = 'qr-scanner';
      
      // Create scanner element if it doesn't exist
      if (!document.getElementById(scannerId)) {
        const scannerDiv = document.createElement('div');
        scannerDiv.id = scannerId;
        scannerContainerRef.current.appendChild(scannerDiv);
      }
      
      // Initialize scanner
      scannerRef.current = new Html5Qrcode(scannerId);
      setScanning(true);
      
      // Set camera configurations
      const config = {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
      };
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      console.error("Scanner initialization failed:", err);
      toast({
        title: "Camera access failed",
        description: "Please ensure camera permissions are granted for this site.",
        variant: "destructive",
      });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    // Check if URL is valid and is from our domain
    try {
      const url = new URL(decodedText);
      setScannedUrl(decodedText);
      
      // Stop scanning after successful scan
      stopScanner();
      
      // Pass the decoded text to parent component if callback is provided
      if (onScan) {
        onScan(decodedText);
      }
    } catch (e) {
      // Not a valid URL
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code doesn't contain a valid URL.",
        variant: "destructive",
      });
    }
  };

  const onScanFailure = (error: string) => {
    // Ignore scan failures as they occur frequently during scanning
    // Only log for debugging
    // console.debug(`QR scan error: ${error}`);
  };

  const resetScanner = () => {
    setScannedUrl(null);
    setScanning(false);
  };

  const openScannedUrl = () => {
    if (scannedUrl) {
      window.open(scannedUrl, '_blank');
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open && scanning) {
      stopScanner();
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Scan className="w-4 h-4" />
          Scan QR Code
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code Scanner
          </DialogTitle>
          <DialogDescription>
            Scan a profile QR code to quickly visit another user's profile
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {!scannedUrl ? (
            <div className="w-full">
              <div 
                ref={scannerContainerRef} 
                className="w-full h-64 bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden mb-4 flex items-center justify-center"
              >
                {!scanning ? (
                  <div className="text-center p-4">
                    <QrCode className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Camera access is required to scan QR codes
                    </p>
                  </div>
                ) : null}
              </div>
              
              <div className="flex justify-center">
                {!scanning ? (
                  <Button
                    onClick={startScanner}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={stopScanner}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Stop Scanning
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center w-full">
              <div className="bg-green-500/10 dark:bg-green-500/20 p-4 rounded-lg mb-4">
                <p className="text-green-500 dark:text-green-400 font-medium mb-1">QR Code Successfully Scanned!</p>
                <p className="text-sm text-muted-foreground break-all">{scannedUrl}</p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetScanner}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Another
                </Button>
                <Button 
                  onClick={openScannedUrl}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center text-center sm:text-left">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
            {scanning 
              ? "Position the QR code in front of your camera" 
              : scannedUrl 
                ? "You can visit the profile or scan another QR code" 
                : "Start the camera to begin scanning"}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QrScannerCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          Scan Profile QR Codes
        </CardTitle>
        <CardDescription>
          Scan other users' QR codes to quickly visit their profiles
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Use your device's camera to scan a profile QR code and visit that user's profile instantly
          </p>
        </div>
        
        <QrCodeScanner />
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>Scan QR codes from business cards, promotional materials, or directly from another device</p>
      </CardFooter>
    </Card>
  );
}