import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, X } from 'lucide-react';

interface QRScannerProps {
  onScanResult: (result: string) => void;
  children: React.ReactNode;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanResult, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanClick = () => {
    setIsScanning(true);
    
    // Simulate QR code scanning - in real app, this would use camera
    // For demo purposes, we'll simulate finding a card number after 2 seconds
    setTimeout(() => {
      const simulatedCardNumbers = [
        '9027001100065679',
        '9027001100065680',
        '9027001100065681',
        '9027001100065682'
      ];
      
      const randomCard = simulatedCardNumbers[Math.floor(Math.random() * simulatedCardNumbers.length)];
      onScanResult(randomCard);
      setIsScanning(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan Bus Card QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-6">
          {!isScanning ? (
            <>
              <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-4">
                <QrCode className="w-16 h-16 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Point your camera at the QR code on your physical bus card
                </p>
              </div>
              
              <Button 
                onClick={handleScanClick}
                className="metro-button-primary"
              >
                Start Scanning
              </Button>
            </>
          ) : (
            <>
              <div className="w-64 h-64 bg-black rounded-lg flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                {/* Scanning animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse">
                  <div className="w-full h-1 bg-primary animate-bounce mt-32"></div>
                </div>
                
                <QrCode className="w-16 h-16 text-white/80" />
                <p className="text-sm text-white text-center px-4">
                  Scanning...
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Looking for QR code
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};