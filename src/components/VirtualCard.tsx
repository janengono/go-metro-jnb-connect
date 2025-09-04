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
    <div className={`relative w-full max-w-[380px] h-[200px] rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Card Background - Matching the image gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 via-blue-500 to-blue-600">

        {/* Bus silhouette in background */}
        
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex items-start justify-between">
        <div className="text-left">
            <div className="text-xs opacity-90">Balance</div>
            <div className="text-lg font-bold">R {balance.toFixed(2)}</div>
          </div>
        
        
          
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

        {/* Middle Section - Card Number */}
        

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs opacity-90">Cardholder</div>
            <div className="text-sm font-medium truncate max-w-[120px]">
              {holderName.toUpperCase()}
            </div>
          </div>
          
          {/* QR Code */}
          <div>
            <div className="text-right">
            <div className="text-xs font-medium opacity-90">
              Metrobus Passenger Card</div>
              </div>
              <div className="text-end">
            <div className="text-xs bg-white/20 px-2 py-1 rounded-md mt-1 inline-block">
              ADULT
            </div>
            </div>
            <div className="text-right">
          <div className="text-lg font-mono font-bold tracking-wider">
            {formatCardNumber(cardNumber)}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};