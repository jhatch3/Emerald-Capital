import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export const LineChart = ({ 
  data, 
  dataKey, 
  xAxisKey, 
  color = 'hsl(270 91% 65%)',
  height = 300 
}: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(240 5% 65%)"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="hsl(240 5% 65%)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(240 8% 10%)',
            border: '1px solid hsl(240 6% 18%)',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          labelStyle={{ color: 'hsl(240 5% 65%)' }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: color }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
