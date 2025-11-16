import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export const BarChart = ({ 
  data, 
  dataKey, 
  xAxisKey, 
  color = 'hsl(220 91% 60%)',
  height = 300 
}: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
