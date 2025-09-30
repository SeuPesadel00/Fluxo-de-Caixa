import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sale, Customer } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface SalesTableProps {
  sales: Sale[];
  onDelete?: (id: string) => void;
}

export const SalesTable = ({ sales, onDelete }: SalesTableProps) => {
  const { customers } = useAppContext();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente não encontrado';
  };

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'quitado':
        return 'default';
      case 'parcial':
        return 'secondary';
      case 'pendente':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getItemsSummary = (sale: Sale) => {
    const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemNames = sale.items.slice(0, 2).map(item => item.product_name).join(', ');
    
    if (sale.items.length > 2) {
      return `${itemNames} e mais ${sale.items.length - 2} itens (${totalItems} total)`;
    }
    
    return `${itemNames} (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Itens</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Lucro</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          {onDelete && <TableHead>Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{getCustomerName(sale.customer_id)}</TableCell>
            <TableCell className="max-w-xs truncate">{getItemsSummary(sale)}</TableCell>
            <TableCell className="font-medium">{formatCurrency(sale.total_value)}</TableCell>
            <TableCell className="text-success font-medium">{formatCurrency(sale.profit)}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(sale.status)}>
                {sale.status === 'quitado' ? 'Quitado' : 
                 sale.status === 'parcial' ? 'Parcial' : 'Pendente'}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(sale.sale_date)}
            </TableCell>
            {onDelete && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(sale.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};