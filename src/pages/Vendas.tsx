import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { BarChart } from '@/components/BarChart';
import { SalesTable } from '@/components/SalesTable';
import { NewSaleModal } from '@/components/NewSaleModal';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, TrendingUp, Package, DollarSign, Plus } from 'lucide-react';

export const Vendas = () => {
  const { sales, customers, logout, deleteSale } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = useMemo(() => {
    const customerTotals = sales.reduce((acc, sale) => {
      const customer = customers.find(c => c.id === sale.customer_id);
      const customerName = customer?.name || 'Cliente não encontrado';
      acc[customerName] = (acc[customerName] || 0) + sale.profit;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sales, customers]);

  const summary = useMemo(() => {
    const totalVendas = sales.reduce((sum, s) => sum + s.total_value, 0);
    const totalLucro = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalItens = sales.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const totalTransacoes = sales.length;

    return {
      vendas: totalVendas,
      lucro: totalLucro,
      itens: totalItens,
      transacoes: totalTransacoes,
    };
  }, [sales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Controle de Vendas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas vendas e analise o desempenho por marca
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(summary.vendas)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {summary.itens}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(summary.lucro)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {summary.transacoes}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Lucro por Cliente</CardTitle>
              <CardDescription>
                Desempenho de lucro por cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <BarChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhuma venda registrada ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Suas últimas vendas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length > 0 ? (
                <SalesTable sales={sales.slice(0, 8)} onDelete={deleteSale} />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhuma venda registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nova Venda
          </Button>
        </div>
        
        <NewSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
};