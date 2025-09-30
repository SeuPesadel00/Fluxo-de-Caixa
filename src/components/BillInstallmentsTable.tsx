import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { BillInstallment } from '@/types';
import { Check, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BillInstallmentsTableProps {
  installments?: BillInstallment[];
}

export const BillInstallmentsTable = ({ installments }: BillInstallmentsTableProps) => {
  const { billInstallments, payBillInstallment } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const data = installments || billInstallments;

  const filteredInstallments = data.filter(installment => {
    if (statusFilter === 'all') return true;
    return installment.status === statusFilter;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: BillInstallment['status']) => {
    switch (status) {
      case 'a_pagar':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">A Pagar</Badge>;
      case 'paga':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Paga</Badge>;
      case 'vencida':
        return <Badge variant="destructive">Vencida</Badge>;
    }
  };

  const handlePayment = (installmentId: string, supplierName: string, value: number) => {
    payBillInstallment(installmentId);
    toast({
      title: 'Pagamento Registrado',
      description: `Parcela de ${supplierName} - ${formatCurrency(value)} paga com sucesso!`,
    });
  };

  const isOverdue = (dueDate: string, status: BillInstallment['status']) => {
    return status === 'vencida' || (status === 'a_pagar' && new Date(dueDate) < new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Parcelas</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="a_pagar">A Pagar</SelectItem>
            <SelectItem value="vencida">Vencidas</SelectItem>
            <SelectItem value="paga">Pagas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstallments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhuma parcela encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredInstallments
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .map((installment) => (
                  <TableRow 
                    key={installment.id}
                    className={isOverdue(installment.due_date, installment.status) && installment.status !== 'paga' 
                      ? 'bg-destructive/5 border-l-4 border-l-destructive' 
                      : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isOverdue(installment.due_date, installment.status) && installment.status !== 'paga' && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        {installment.supplier_name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={installment.description}>
                      {installment.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {installment.installment_number}/{installment.total_installments}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(installment.due_date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(installment.value)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(installment.status)}
                    </TableCell>
                    <TableCell>
                      {installment.status !== 'paga' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayment(installment.id, installment.supplier_name, installment.value)}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Pagar
                        </Button>
                      )}
                      {installment.status === 'paga' && installment.payment_date && (
                        <div className="text-sm text-muted-foreground">
                          Pago em {formatDate(installment.payment_date)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};