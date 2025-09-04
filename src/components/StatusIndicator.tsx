import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, AlertTriangle, X } from 'lucide-react';

type Status = 'online' | 'warning' | 'offline' | 'full';

interface StatusIndicatorProps {
  status: Status;
  showText?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showText = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          variant: 'online' as const,
          text: 'Available',
          icon: Circle,
          className: 'metro-status-online',
        };
      case 'full':
        return {
          variant: 'full' as const,
          text: 'Full',
          icon: AlertTriangle,
          className: 'metro-status-warning',
        };
      case 'warning':
        return {
          variant: 'warning' as const,
          text: 'Overcapacity',
          icon: X,
          className: 'metro-status-offline',
        };
      case 'offline':
        return {
          variant: 'offline' as const,
          text: 'Offline',
          icon: X,
          className: 'metro-status-offline',
        };
      default:
        return {
          variant: 'online' as const,
          text: 'Available',
          icon: Circle,
          className: 'metro-status-online',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={`${config.className} px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1`}
    >
      <Icon className="w-3 h-3" />
      {showText && <span>{config.text}</span>}
    </Badge>
  );
};
