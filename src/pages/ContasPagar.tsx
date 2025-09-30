import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { SupplierModal } from '@/components/SupplierModal';
import { BillModal } from '@/components/BillModal';
import { BillInstallmentsTable } from '@/components/BillInstallmentsTable';
import { Supplier } from '@/types';
import { 
  Building, 
  FileText, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContasPagar() {
  const { suppliers, bills, billInstallments, deleteSupplier, deleteBill } = useAppContext();
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const { toast } = useToast();

  // Cálculos do Dashboard
  const financialSummary = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyInstallments = billInstallments.filter(installment => {
      const dueDate = new Date(installment.due_date);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    });

    const totalToPay = monthlyInstallments
      .filter(i => i.status === 'a_pagar' || i.status === 'vencida')
      .reduce((sum, i) => sum + i.value, 0);

    const totalPaid = monthlyInstallments
      .filter(i => i.status === 'paga')
      .reduce((sum, i) => sum + i.value, 0);

    const totalDebt = billInstallments
      .filter(i => i.status === 'a_pagar' || i.status === 'vencida')
      .reduce((sum, i) => sum + i.value, 0);

    const overdueCount = billInstallments.filter(i => i.status === 'vencida').length;

    return {
      totalToPay,
      totalPaid,
      totalDebt,
      overdueCount
    };
  }, [billInstallments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    const hasActiveBills = bills.some(bill => bill.supplier_id === id);
    
    if (hasActiveBills) {
      toast({
        title: 'Não é possível excluir',
        description: 'Este fornecedor possui contas cadastradas. Exclua as contas primeiro.',
        variant: 'destructive',
      });
      return;
    }

    deleteSupplier(id);
    toast({
      title: 'Fornecedor excluído',
      description: `${name} foi removido com sucesso.`,
    });
  };

  const handleDeleteBill = (id: string, description: string) => {
    deleteBill(id);
    toast({
      title: 'Conta excluída',
      description: `${description} foi removida com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">Gerencie fornecedores e contas a pagar</p>
          </div>
        </div>

        {/* Dashboard Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Pagar (Mês Atual)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(financialSummary.totalToPay)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago (Mês Atual)</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(financialSummary.totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Devedor Total</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {formatCurrency(financialSummary.totalDebt)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parcelas Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {financialSummary.overdueCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Parcelas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Controle de Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BillInstallmentsTable />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fornecedores */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Fornecedores
                </CardTitle>
                <Button
                  onClick={() => setIsSupplierModalOpen(true)}
                  size="sm"
                  className="bg-gradient-primary"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Nenhum fornecedor cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      suppliers.map((supplier: Supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{supplier.name}</p>
                              {supplier.cnpj && (
                                <p className="text-sm text-muted-foreground">{supplier.cnpj}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {supplier.phone && <p>{supplier.phone}</p>}
                              {supplier.email && <p>{supplier.email}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Contas Cadastradas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contas Cadastradas
                </CardTitle>
                <Button
                  onClick={() => setIsBillModalOpen(true)}
                  size="sm"
                  disabled={suppliers.length === 0}
                  className="bg-gradient-primary"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {suppliers.length === 0 
                            ? 'Cadastre fornecedores primeiro' 
                            : 'Nenhuma conta cadastrada'
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">
                            {bill.supplier_name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={bill.description}>
                            {bill.description}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(bill.total_value)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bill.installments_count}x
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBill(bill.id, bill.description)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button onClick={() => setIsBillModalOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nova Conta
        </Button>
      </div>

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
    </div>
  );
}