import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { BarChart } from '@/components/BarChart';
import { Button } from '@/components/ui/button';
import { mockMonthlyPerformance } from '@/data/mockDashboardData';

export const Dashboard = () => {
  const { signOut } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Mock data based on new gemini.md schema
  const dashboardData = {
    saldo_atual: 15450.00,
    receitas_mes: 28350.00,
    despesas_mes: 12900.00,
    lucro_real: 15450.00,
  };

  const transacoes_recentes = [
    { id: '1', descricao: 'Venda de Consultoria', valor: 2500, tipo: 'receita', data: 'Hoje, 14:30', status: 'concluido' },
    { id: '2', descricao: 'Google Workspace', valor: 150, tipo: 'despesa', data: 'Hoje, 09:15', status: 'concluido' },
    { id: '3', descricao: 'Mentoria Startup X', valor: 4000, tipo: 'receita', data: 'Ontem, 16:45', status: 'pendente' },
    { id: '4', descricao: 'Equipamento de Vídeo', valor: 1200, tipo: 'despesa', data: 'Ontem, 11:20', status: 'concluido' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] bg-[url('https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      <div className="min-h-screen bg-black/80 backdrop-blur-md">
        <Navbar onLogout={signOut} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                Visão Geral
              </h1>
              <p className="text-zinc-400">
                Acompanhe o seu lucro real e fluxo de caixa em tempo real.
              </p>
            </div>
            
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </div>

          {/* KPIs Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Saldo Atual</CardTitle>
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(dashboardData.saldo_atual)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Receitas do Mês</CardTitle>
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(dashboardData.receitas_mes)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Despesas do Mês</CardTitle>
                <div className="p-2 rounded-full bg-rose-500/20 text-rose-400">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(dashboardData.despesas_mes)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-200">Lucro Real</CardTitle>
                <div className="p-2 rounded-full bg-white/10 text-white">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(dashboardData.lucro_real)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Evolução Financeira</CardTitle>
                <CardDescription className="text-zinc-400">Receitas x Despesas nos últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart data={mockMonthlyPerformance} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle className="text-white">Transações Recentes</CardTitle>
                <CardDescription className="text-zinc-400">Últimas movimentações</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {transacoes_recentes.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.tipo === 'receita' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
                        <div>
                          <p className="font-medium text-white text-sm">{t.descricao}</p>
                          <p className="text-xs text-zinc-500">{t.data}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.tipo === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 uppercase tracking-wider">
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/10">
                  Ver todas as transações
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
