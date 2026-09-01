import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductModal } from '@/components/ProductModal';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Package, Edit, Search, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { SpreadsheetUploader, ExpectedColumn } from '@/components/SpreadsheetUploader';

const PRODUCT_COLUMNS: ExpectedColumn[] = [
  { key: 'name', label: 'Nome do Produto', required: true },
  { key: 'barcode', label: 'Código de Barras' },
  { key: 'sale_price', label: 'Preço de Venda', required: true },
  { key: 'cost_price', label: 'Preço de Custo' },
  { key: 'stock_quantity', label: 'Quantidade em Estoque', required: true },
  { key: 'minimum_stock', label: 'Estoque Mínimo' },
  { key: 'category', label: 'Categoria' },
];

export const Produtos = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_date', { ascending: false });
      
    if (error) {
      toast({ title: 'Erro ao buscar produtos', description: error.message, variant: 'destructive' });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockProducts = products.filter(product => 
    product.minimum_stock && product.stock_quantity <= product.minimum_stock
  ).length;

  const outOfStockProducts = products.filter(product => 
    product.stock_quantity === 0
  ).length;

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    
    const { error } = await supabase.from('products').delete().eq('id', productToDelete);
    
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso!' });
      setProducts(products.filter(p => p.id !== productToDelete));
    }
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'created_date'>) => {
    if (editingProduct) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...productData })
        .eq('id', editingProduct.id)
        .select()
        .single();
        
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
      } else {
        setProducts(products.map(p => p.id === editingProduct.id ? data : p));
        toast({ title: 'Sucesso', description: 'Produto atualizado!' });
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user?.id }])
        .select()
        .single();
        
      if (error) {
        toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' });
      } else {
        setProducts([data, ...products]);
        toast({ title: 'Sucesso', description: 'Produto criado!' });
      }
    }
    setEditingProduct(undefined);
    setIsModalOpen(false);
  };
  
  const handleImportSpreadsheet = async (importedData: any[]) => {
    setLoading(true);
    
    const formattedData = importedData.map(row => ({
      user_id: user?.id,
      name: row.name,
      barcode: row.barcode || `IMP${Date.now()}${Math.floor(Math.random() * 1000)}`,
      sale_price: parseFloat(row.sale_price) || 0,
      cost_price: parseFloat(row.cost_price) || 0,
      stock_quantity: parseInt(row.stock_quantity) || 0,
      minimum_stock: parseInt(row.minimum_stock) || 5,
      category: row.category || 'Geral',
      status: 'ativo'
    }));

    const { data, error } = await supabase
      .from('products')
      .insert(formattedData)
      .select();

    if (error) {
      toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Importação Concluída', description: `${data?.length || 0} produtos cadastrados!` });
      setProducts([...(data || []), ...products]);
    }
    
    setLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: 'Sem Estoque', variant: 'destructive' as const, color: 'text-destructive' };
    }
    if (product.minimum_stock && product.stock_quantity <= product.minimum_stock) {
      return { status: 'Estoque Baixo', variant: 'secondary' as const, color: 'text-warning' };
    }
    return { status: 'Em Estoque', variant: 'default' as const, color: 'text-success' };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={signOut} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              Gestão de Produtos
              {loading && <RefreshCw className="h-5 w-5 animate-spin text-primary" />}
            </h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de produtos e controle de estoque
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={() => {
              setEditingProduct(undefined);
              setIsModalOpen(true);
            }} size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        <SpreadsheetUploader 
          title="Importar Produtos em Lote"
          expectedColumns={PRODUCT_COLUMNS}
          onDataImported={handleImportSpreadsheet}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {products.length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {products.filter(p => p.status === 'ativo').length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {lowStockProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {outOfStockProducts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Products Table */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle>Catálogo de Produtos</CardTitle>
            <CardDescription>
              Lista completa dos produtos cadastrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-black/40 border-white/10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Nome</TableHead>
                    <TableHead className="text-zinc-400">Código</TableHead>
                    <TableHead className="text-zinc-400">Categoria</TableHead>
                    <TableHead className="text-zinc-400">Preço</TableHead>
                    <TableHead className="text-zinc-400">Estoque</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockInfo = getStockStatus(product);
                    return (
                      <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm text-zinc-400">{product.barcode || '-'}</TableCell>
                        <TableCell className="text-zinc-300">{product.category || '-'}</TableCell>
                        <TableCell className="text-primary font-medium">{formatCurrency(product.sale_price)}</TableCell>
                        <TableCell className={stockInfo.color}>
                          {product.stock_quantity}
                          {product.minimum_stock && <span className="text-xs text-zinc-500 block">Mín: {product.minimum_stock}</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockInfo.variant} className="bg-black/50">
                            {stockInfo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="text-primary hover:text-primary hover:bg-primary/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(product.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum produto encontrado</p>
                <p className="text-sm text-zinc-500 mt-2">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Faça upload de uma planilha ou cadastre manualmente'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          product={editingProduct}
        />

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent className="bg-[#121214] border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto do seu banco de dados e removerá os dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </main>
    </div>
  );
};