import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

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
            padding: '10px 14px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
          labelStyle={{ color: 'hsl(240 5% 65%)', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          animationDuration={150}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
          animationDuration={400}
        >
          {data.map((entry: any, index: number) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || color}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
