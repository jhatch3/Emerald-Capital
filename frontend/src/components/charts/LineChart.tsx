import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush, Legend, ReferenceLine } from 'recharts';
import { useState } from 'react';

interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  showBrush?: boolean;
  showLegend?: boolean;
  multipleLines?: Array<{ dataKey: string; color: string; name: string }>;
  interactive?: 'hover' | 'click' | 'both';
  showTimeRangeSelector?: boolean;
  selectedDays?: number;
  onTimeRangeChange?: (days: number) => void;
}

export const LineChart = ({ 
  data, 
  dataKey, 
  xAxisKey, 
  color = 'hsl(0 0% 98%)',
  height = 300,
  showBrush = false,
  showLegend = false,
  multipleLines = [],
  interactive = 'hover',
  showTimeRangeSelector = false,
  selectedDays = 730,
  onTimeRangeChange
}: LineChartProps) => {
  const hasMultipleLines = multipleLines.length > 0;
  const [localSelectedDays, setLocalSelectedDays] = useState(selectedDays);
  
  const timeRanges = [
    { label: '1D', days: 1 },
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 730 }
  ];
  
  const handleTimeRangeSelect = (days: number) => {
    setLocalSelectedDays(days);
    if (onTimeRangeChange) {
      onTimeRangeChange(days);
    }
  };
  
  const currentDays = onTimeRangeChange ? selectedDays : localSelectedDays;
  const displayData = currentDays >= data.length ? data : data.slice(-currentDays);
  
  // Calculate interval and angle for x-axis labels based on data length
  const xAxisInterval = displayData.length > 30 ? Math.floor(displayData.length / 5) : 0;
  const xAxisAngle = displayData.length > 30 ? -30 : 0;
  const xAxisTextAnchor = displayData.length > 30 ? 'end' : 'middle';
  const xAxisHeight = displayData.length > 30 ? 50 : 30;
  const marginBottom = displayData.length > 30 ? 60 : 5;
  
  return (
    <div className="relative w-full">
      {showTimeRangeSelector && (
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => handleTimeRangeSelect(range.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentDays === range.days
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart 
        data={displayData} 
        margin={{ top: showTimeRangeSelector ? 50 : 5, right: 20, left: 0, bottom: showBrush ? 40 : marginBottom }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" opacity={0.3} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(240 5% 65%)"
          style={{ fontSize: '12px' }}
          tick={{ fill: 'hsl(240 5% 65%)' }}
          interval={xAxisInterval}
          angle={xAxisAngle}
          textAnchor={xAxisTextAnchor}
          height={xAxisHeight}
        />
        <YAxis 
          stroke="hsl(240 5% 65%)"
          style={{ fontSize: '12px' }}
          tick={{ fill: 'hsl(240 5% 65%)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(240 8% 10%)',
            border: '1px solid hsl(240 6% 18%)',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '10px 14px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: 'hsl(240 5% 65%)', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}
          cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '0', opacity: 0.5 }}
          animationDuration={150}
          formatter={(value: any, name: string, props: any) => {
            // Format numbers nicely
            if (typeof value === 'number') {
              // For portfolio amount, show as currency
              if (name === 'amount' || name === 'Amount' || dataKey === 'amount') {
                return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Portfolio Amount'];
              }
              // For normalized TVL, show actual TVL value from data
              if (name === 'TVL' && props.payload?.tvl) {
                return [`$${props.payload.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name];
              }
              if (name.includes('TVL') || (name.includes('tvl') && !name.includes('Normalized'))) {
                return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name];
              }
              return [value.toFixed(4), name];
            }
            return [value, name];
          }}
        />
        {hasMultipleLines ? (
          multipleLines.map((line, index) => (
            <Line 
              key={index}
              type="monotone" 
              dataKey={line.dataKey} 
              stroke={line.color}
              strokeWidth={3}
              dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: line.color }}
              activeDot={{ r: 8, fill: line.color, strokeWidth: 3, stroke: '#fff', cursor: 'pointer' }}
              name={line.name}
              isAnimationActive={true}
              animationDuration={400}
            />
          ))
        ) : (
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: color }}
            activeDot={{ r: 10, fill: color, strokeWidth: 3, stroke: '#fff', cursor: 'pointer' }}
            animationDuration={400}
            isAnimationActive={true}
          />
        )}
        {showLegend && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => <span style={{ color: 'hsl(240 5% 65%)', fontSize: '12px' }}>{value}</span>}
          />
        )}
        {showBrush && (
          <Brush 
            dataKey={xAxisKey}
            height={30}
            stroke="hsl(240 5% 65%)"
            fill="hsl(240 6% 18%)"
            tickFormatter={(value) => value}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
    </div>
  );
};
