import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { SaleItem, Customer } from '@/types';
import { Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewSaleModal = ({ isOpen, onClose }: NewSaleModalProps) => {
  const { customers, getProductByBarcode, addSale } = useAppContext();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [saleItems, setSaleItems] = useState<Omit<SaleItem, 'id' | 'total_price'>[]>([]);
  const { toast } = useToast();

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;

    const product = getProductByBarcode(barcodeInput.trim());
    
    if (!product) {
      toast({
        title: 'Produto não encontrado',
        description: 'Código de barras não cadastrado no sistema.',
        variant: 'destructive',
      });
      setBarcodeInput('');
      return;
    }

    if (product.stock_quantity <= 0) {
      toast({
        title: 'Produto fora de estoque',
        description: `${product.name} não possui estoque disponível.`,
        variant: 'destructive',
      });
      setBarcodeInput('');
      return;
    }

    // Verificar se o produto já está na lista
    const existingItemIndex = saleItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Incrementar quantidade se já existe
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + 1;
      
      if (newQuantity > product.stock_quantity) {
        toast({
          title: 'Estoque insuficiente',
          description: `Apenas ${product.stock_quantity} unidades disponíveis.`,
          variant: 'destructive',
        });
        setBarcodeInput('');
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setSaleItems(updatedItems);
    } else {
      // Adicionar novo item
      const newItem: Omit<SaleItem, 'id' | 'total_price'> = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
      };
      setSaleItems(prev => [...prev, newItem]);
    }

    setBarcodeInput('');
    
    // Manter foco no campo de código de barras
    setTimeout(() => {
      const barcodeField = document.getElementById('barcode-input');
      barcodeField?.focus();
    }, 100);
  };

  const handleRemoveItem = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = getProductByBarcode(''); // Precisamos encontrar o produto pelo ID
    // Aqui seria ideal ter um método getProductById
    
    setSaleItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleFinalizeSale = () => {
    if (!selectedCustomer) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente para a venda.',
        variant: 'destructive',
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um produto à venda.',
        variant: 'destructive',
      });
      return;
    }

    addSale({
      customer_id: selectedCustomer,
      items: saleItems
    });

    // Reset form
    setSelectedCustomer('');
    setSaleItems([]);
    setBarcodeInput('');

    toast({
      title: 'Sucesso',
      description: 'Venda registrada com sucesso!',
    });

    onClose();
  };

  const handleClose = () => {
    setSelectedCustomer('');
    setSaleItems([]);
    setBarcodeInput('');
    onClose();
  };

  const totalValue = saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda selecionando cliente e adicionando produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer: Customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Código de Barras */}
          <div className="space-y-2">
            <Label htmlFor="barcode-input">Código de Barras</Label>
            <form onSubmit={handleBarcodeSubmit}>
              <Input
                id="barcode-input"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escaneie ou digite o código de barras"
                autoFocus
              />
            </form>
          </div>

          {/* Lista de Itens */}
          {saleItems.length > 0 && (
            <div className="space-y-2">
              <Label>Itens da Venda</Label>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-20">Qtd</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-10">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleItems.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                            className="w-16 text-center"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Total da Venda */}
          {saleItems.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total da Venda</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          )}

          {/* Alertas */}
          {customers.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                Nenhum cliente cadastrado. Cadastre clientes antes de fazer vendas.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleFinalizeSale}
            disabled={!selectedCustomer || saleItems.length === 0}
            className="bg-gradient-primary"
          >
            Finalizar Venda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};