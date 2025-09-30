import { Navbar } from '@/components/Navbar';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { BarChart } from '@/components/BarChart';
import { ToolsWidget } from '@/components/ToolsWidget';
import { NotesWidget } from '@/components/NotesWidget';
import {
  mockSalesData,
  mockDailySales,
  mockTopProducts,
  mockTopCustomers,
  mockMonthlyPerformance,
  mockLowStockProducts,
} from '@/data/mockDashboardData';

export const Dashboard = () => {
  const { logout } = useAppContext();

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
            Dashboard - Fluxo de Caixa
          </h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio em tempo real
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(mockSalesData.today)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(mockSalesData.month)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(mockSalesData.averageTicket)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Hoje</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {mockSalesData.customersToday}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Vendas Diárias (Últimos 7 dias)</CardTitle>
              <CardDescription>Faturamento por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={mockDailySales} />
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Performance Mensal</CardTitle>
              <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={mockMonthlyPerformance} />
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
              <CardDescription>Ranking do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Top 5 Clientes do Mês</CardTitle>
              <CardDescription>Maiores compradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 text-success font-bold">
                        {index + 1}
                      </div>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(customer.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alert and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Estoque Baixo
              </CardTitle>
              <CardDescription>Produtos que precisam reposição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLowStockProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Mínimo: {product.minStock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">{product.stock}</p>
                      <p className="text-xs text-muted-foreground">unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            <ToolsWidget />
            <NotesWidget />
          </div>
        </div>
      </main>
    </div>
  );
};
