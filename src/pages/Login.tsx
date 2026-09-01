import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LockKeyhole, Mail } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'master' && password === 'fluxodecaixa123') {
      login();
    } else {
      alert('Credenciais inválidas. Use: master / fluxodecaixa123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center relative p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
      
      <Card className="w-full max-w-md z-10 border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">Fluxo de Caixa</CardTitle>
            <CardDescription className="text-zinc-400 text-base">
              Entre para gerenciar seu negócio
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Usuário</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary h-11"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Senha</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary h-11"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] h-11 text-base transition-all"
            >
              Acessar Painel
            </Button>
          </form>
          
          <div className="mt-8 text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-zinc-400">
              Usuário: <strong className="text-white">master</strong><br/>
              Senha: <strong className="text-white">fluxodecaixa123</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};