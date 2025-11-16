import { ReactNode } from 'react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  valueColor?: 'green' | 'red' | 'blue' | 'default';
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  valueColor = 'default'
}: MetricCardProps) => {
  const valueColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    default: 'text-foreground'
  };

  return (
    <Card className="glass-card p-4 hover-glow-primary transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1 truncate">{title}</div>
          <div className={`text-xl font-bold mb-1 truncate ${valueColorClasses[valueColor]}`}>{value}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
          )}
          {trend && trendValue && (
            <div className={`text-xs font-medium mt-1 truncate ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-evergreen-glow flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
};
