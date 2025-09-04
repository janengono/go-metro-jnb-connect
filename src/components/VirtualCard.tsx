import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface VirtualCardProps {
  cardNumber: string;
  balance: number;
  holderName: string;
  className?: string;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({
  cardNumber,
  balance,
  holderName,
  className = ""
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(cardNumber, {
          width: 80,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (cardNumber) {
      generateQRCode();
    }
  }, [cardNumber]);

  // Format card number with spaces
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className={`relative w-full max-w-[320px] h-[200px] rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Card Background - Matching the image gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500">
        {/* Bus silhouette in background */}
        <div className="absolute top-4 right-6 opacity-20">
          <div className="w-16 h-8 bg-white/30 rounded-lg flex items-center justify-center">
            <svg className="w-12 h-6 text-white" viewBox="0 0 24 12" fill="currentColor">
              <rect x="2" y="3" width="20" height="6" rx="1"/>
              <rect x="4" y="4" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7"/>
              <rect x="8.5" y="4" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7"/>
              <rect x="13" y="4" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.7"/>
              <circle cx="6" cy="10" r="1"/>
              <circle cx="18" cy="10" r="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium opacity-90">Metrobus Passenger Card</div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded-md mt-1 inline-block">
              ADULT
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">Balance</div>
            <div className="text-lg font-bold">R {balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Middle Section - Card Number */}
        <div className="text-center">
          <div className="text-lg font-mono font-bold tracking-wider">
            {formatCardNumber(cardNumber)}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs opacity-90">Cardholder</div>
            <div className="text-sm font-medium truncate max-w-[120px]">
              {holderName.toUpperCase()}
            </div>
          </div>
          
          {/* QR Code */}
          <div className="bg-white p-1 rounded-lg">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Card QR Code" 
                className="w-12 h-12"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <div className="text-xs text-gray-500">QR</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};