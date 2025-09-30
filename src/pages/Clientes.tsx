import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CustomerModal } from '@/components/CustomerModal';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, UserPlus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Clientes = () => {
  const { customers, sales, logout, addCustomer, deleteCustomer } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const getCustomerStats = (customerId: string) => {
    const customerSales = sales.filter(sale => sale.customer_id === customerId);
    const totalSales = customerSales.length;
    const totalValue = customerSales.reduce((sum, sale) => sum + sale.total_value, 0);
    const totalPaid = customerSales.reduce((sum, sale) => 
      sum + sale.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0
    );
    const totalDebt = totalValue - totalPaid;
    
    return {
      totalSales,
      totalValue,
      totalPaid,
      totalDebt,
    };
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customerStats = getCustomerStats(customerId);
    
    if (customerStats.totalDebt > 0) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir cliente com pendências financeiras.',
        variant: 'destructive',
      });
      return;
    }

    deleteCustomer(customerId);
    toast({
      title: 'Sucesso',
      description: 'Cliente excluído com sucesso!',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Cadastro de Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe o histórico de vendas
          </p>
        </div>

        {/* Summary Card */}
        <div className="mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {customers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Informações e histórico dos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Total Vendido</TableHead>
                    <TableHead>Pendência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => {
                    const stats = getCustomerStats(customer.id);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{stats.totalSales}</TableCell>
                        <TableCell>{formatCurrency(stats.totalValue)}</TableCell>
                        <TableCell className={stats.totalDebt > 0 ? 'text-destructive font-medium' : 'text-success'}>
                          {formatCurrency(stats.totalDebt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stats.totalDebt > 0 ? 'destructive' : 'default'}>
                            {stats.totalDebt > 0 ? 'Pendente' : 'Quitado'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(customer.created_date)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum cliente cadastrado ainda</p>
                <p className="text-sm">Clique no botão + para adicionar o primeiro cliente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 mt-6">
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addCustomer}
        />
      </main>
    </div>
  );
};