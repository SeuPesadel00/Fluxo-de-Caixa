import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, StickyNote } from 'lucide-react';

export const ToolsWidget = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [notes, setNotes] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('financas-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes changes
  useEffect(() => {
    localStorage.setItem('financas-notes', notes);
  }, [notes]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const CalculatorButton = ({ onClick, className = '', children }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
  }) => (
    <Button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      variant="outline"
      className={`h-12 text-lg font-semibold ${className}`}
      type="button"
    >
      {children}
    </Button>
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Ferramentas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-right text-2xl font-mono font-bold">
                {display}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <CalculatorButton onClick={clearAll} className="bg-destructive/20 hover:bg-destructive/30">
                C
              </CalculatorButton>
              <CalculatorButton onClick={() => {}} className="bg-muted hover:bg-muted/80">
                ±
              </CalculatorButton>
              <CalculatorButton onClick={() => {}} className="bg-muted hover:bg-muted/80">
                %
              </CalculatorButton>
              <CalculatorButton onClick={() => inputOperation('÷')} className="bg-primary/20 hover:bg-primary/30">
                ÷
              </CalculatorButton>

              <CalculatorButton onClick={() => inputNumber('7')}>7</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('8')}>8</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('9')}>9</CalculatorButton>
              <CalculatorButton onClick={() => inputOperation('×')} className="bg-primary/20 hover:bg-primary/30">
                ×
              </CalculatorButton>

              <CalculatorButton onClick={() => inputNumber('4')}>4</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('5')}>5</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('6')}>6</CalculatorButton>
              <CalculatorButton onClick={() => inputOperation('-')} className="bg-primary/20 hover:bg-primary/30">
                -
              </CalculatorButton>

              <CalculatorButton onClick={() => inputNumber('1')}>1</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('2')}>2</CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('3')}>3</CalculatorButton>
              <CalculatorButton onClick={() => inputOperation('+')} className="bg-primary/20 hover:bg-primary/30">
                +
              </CalculatorButton>

              <CalculatorButton onClick={() => inputNumber('0')} className="col-span-2">
                0
              </CalculatorButton>
              <CalculatorButton onClick={() => inputNumber('.')}>.</CalculatorButton>
              <CalculatorButton onClick={performCalculation} className="bg-primary text-primary-foreground hover:bg-primary/90">
                =
              </CalculatorButton>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4" />
              <span className="text-sm font-medium">Bloco de Notas</span>
            </div>
            <Textarea
              placeholder="Digite suas anotações aqui..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Suas anotações são salvas automaticamente no navegador.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};