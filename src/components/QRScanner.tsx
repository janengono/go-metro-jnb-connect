import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  onScanResult: (value: string) => void;
  children: React.ReactNode;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanResult, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Trigger button */}
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {/* Modal scanner */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>

            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScanResult(result[0].rawValue); // ✅ extract text from QR
                  setIsOpen(false);
                }
              }}
              onError={(error) => console.error(error)}
              constraints={{ facingMode: "environment" }}
              styles={{ container: { width: "100%" } }}
            />

            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full bg-gray-200 px-3 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
