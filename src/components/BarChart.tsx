import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title?: string;
}

export const BarChart = ({ data, title }: BarChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(215, 16%, 47%)"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(215, 16%, 47%)"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(Number(value)), 'Lucro']}
            labelStyle={{ color: 'hsl(224, 15%, 15%)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(214, 32%, 91%)',
              borderRadius: '0.75rem'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="hsl(142, 86%, 28%)" 
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};