import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Calendar,
  Clock,
  TrendingUp,
  Settings,
  Filter
} from 'lucide-react';

interface NewsItem {
  id: string;
  type: 'alert' | 'announcement' | 'update' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
}

interface PriceUpdate {
  route: string;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string;
}

export const NewsCard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'announcements'>('all');

  const newsItems: NewsItem[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Route 243 Service Disruption',
      description: 'Due to road maintenance on Jan Smuts Avenue, Route 243 buses will be delayed by 15-20 minutes between 14:00-17:00 today.',
      timestamp: '2024-08-30 13:45',
      priority: 'high',
      isRead: false
    },
    {
      id: '2',
      type: 'announcement',
      title: 'New Route: Sandton to Fourways',
      description: 'We\'re excited to announce a new express route connecting Sandton City to Fourways Mall, starting September 1st, 2024.',
      timestamp: '2024-08-30 09:30',
      priority: 'medium',
      isRead: false
    },
    {
      id: '3',
      type: 'update',
      title: 'Fare Adjustment Notice',
      description: 'Bus fares will be adjusted by R1.50 across all routes, effective September 15th, 2024. Digital wallet users receive a 5% discount.',
      timestamp: '2024-08-29 16:20',
      priority: 'high',
      isRead: true
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'System Maintenance Scheduled',
      description: 'GoMetro app will undergo scheduled maintenance on Sunday, September 3rd from 02:00-06:00. Some features may be temporarily unavailable.',
      timestamp: '2024-08-29 10:15',
      priority: 'low',
      isRead: true
    }
  ];

  const priceUpdates: PriceUpdate[] = [
    { route: 'All Routes', oldPrice: 8.50, newPrice: 10.00, effectiveDate: '2024-09-15' },
    { route: 'Express Routes', oldPrice: 12.00, newPrice: 14.00, effectiveDate: '2024-09-15' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return AlertTriangle;
      case 'announcement':
        return Bell;
      case 'update':
        return TrendingUp;
      case 'maintenance':
        return Settings;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-alert/10 text-alert border border-alert/20';
      case 'announcement':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'update':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'maintenance':
        return 'bg-muted/50 text-muted-foreground border border-muted';
      default:
        return 'bg-muted/50 text-muted-foreground border border-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-alert text-white';
      case 'medium':
        return 'bg-status-warning text-white';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredNews = newsItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return item.type === 'alert';
    if (filter === 'announcements') return item.type === 'announcement' || item.type === 'update';
    return true;
  });

  const unreadCount = newsItems.filter(item => !item.isRead).length;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <div>
              <h2 className="metro-subheading">News & Alerts</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">{unreadCount} unread updates</p>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {['all', 'alerts', 'announcements'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType as any)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>
      </Card>

      {/* Price Updates Card */}
      <Card className="metro-card border-secondary/20">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-secondary" />
          <h3 className="metro-subheading">Upcoming Price Changes</h3>
        </div>
        
        <div className="space-y-3">
          {priceUpdates.map((update, index) => (
            <div 
              key={index}
              className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground">{update.route}</p>
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {update.effectiveDate}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground line-through">R{update.oldPrice.toFixed(2)}</span>
                <span className="text-secondary font-semibold">→ R{update.newPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* News Items */}
      <div className="space-y-4">
        {filteredNews.map((item, index) => {
          const TypeIcon = getTypeIcon(item.type);
          
          return (
            <Card 
              key={item.id}
              className={`metro-card metro-fade-in ${
                !item.isRead ? 'border-primary/20 bg-primary/5' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${
                      !item.isRead ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${getPriorityColor(item.priority)}`}
                      >
                        {item.priority}
                      </Badge>
                      
                      {!item.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    !item.isRead ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Emergency Contact */}
      <Card className="metro-card border-alert/20 bg-alert/5">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-alert" />
          <h3 className="font-semibold text-alert">Emergency Contact</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          For urgent issues or emergencies while traveling, contact our 24/7 support line.
        </p>
        
        <Button variant="outline" className="w-full border-alert text-alert hover:bg-alert hover:text-white">
          Call Emergency Line
        </Button>
      </Card>
    </div>
  );
};