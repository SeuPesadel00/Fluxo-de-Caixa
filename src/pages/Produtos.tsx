import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductModal } from '@/components/ProductModal';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, Edit, Search, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';

export const Produtos = () => {
  const { products, logout, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
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

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: 'Sucesso',
      description: 'Produto excluído com sucesso!',
    });
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'created_date'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setEditingProduct(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
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
      <Navbar onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestão de Produtos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos e controle de estoque
          </p>
        </div>

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
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockInfo = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell>{formatCurrency(product.sale_price)}</TableCell>
                        <TableCell className={stockInfo.color}>
                          {product.stock_quantity}
                          {product.minimum_stock && ` (mín: ${product.minimum_stock})`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockInfo.variant}>
                            {stockInfo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(product.created_date)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="text-primary hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
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
                <p className="text-sm">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Clique no botão + para adicionar o primeiro produto'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6 mt-6">
          <Button onClick={() => {
            setEditingProduct(undefined);
            setIsModalOpen(true);
          }} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Produto
          </Button>
        </div>
        
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      </main>
    </div>
  );
};