import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface KPI {
  label: string;
  value: number;
  format?: 'currency' | 'number';
}

interface SummaryCardProps {
  title: string;
  description?: string;
  kpis: KPI[];
  buttonText: string;
  onClickButton: () => void;
  icon?: React.ReactNode;
}

export const SummaryCard = ({ 
  title, 
  description,
  kpis, 
  buttonText, 
  onClickButton, 
  icon 
}: SummaryCardProps) => {
  const formatValue = (value: number, format: 'currency' | 'number' = 'currency') => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    return value.toString();
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 bg-gradient-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold text-primary">
                {formatValue(kpi.value, kpi.format)}
              </p>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>
        <Button 
          onClick={onClickButton} 
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};