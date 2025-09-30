import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'created_date'>) => void;
  product?: Product;
}

const categories = [
  'Perfumes',
  'Cosméticos',
  'Cuidados Pessoais',
  'Maquiagem',
  'Cabelos',
  'Corpo e Banho',
  'Casa',
  'Acessórios',
  'Outros'
];

export const ProductModal = ({ isOpen, onClose, onSave, product }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    description: product?.description || '',
    sale_price: product?.sale_price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    minimum_stock: product?.minimum_stock?.toString() || '',
    category: product?.category || '',
    status: product?.status || 'ativo' as Product['status']
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.barcode || !formData.sale_price || formData.stock_quantity === '') {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const salePrice = parseFloat(formData.sale_price);
    const stockQuantity = parseInt(formData.stock_quantity);

    if (salePrice <= 0 || stockQuantity < 0) {
      toast({
        title: 'Erro',
        description: 'Preço deve ser maior que zero e estoque não pode ser negativo.',
        variant: 'destructive',
      });
      return;
    }

    const productData: Omit<Product, 'id' | 'created_date'> = {
      name: formData.name,
      barcode: formData.barcode,
      description: formData.description || undefined,
      sale_price: salePrice,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
      stock_quantity: stockQuantity,
      minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : undefined,
      category: formData.category || undefined,
      status: formData.status,
    };

    onSave(productData);
    
    // Reset form
    setFormData({
      name: '',
      barcode: '',
      description: '',
      sale_price: '',
      cost_price: '',
      stock_quantity: '0',
      minimum_stock: '',
      category: '',
      status: 'ativo'
    });
    
    toast({
      title: 'Sucesso',
      description: product ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!',
    });
    
    onClose();
  };

  const handleClose = () => {
    if (!product) {
      setFormData({
        name: '',
        barcode: '',
        description: '',
        sale_price: '',
        cost_price: '',
        stock_quantity: '0',
        minimum_stock: '',
        category: '',
        status: 'ativo'
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Cadastrar Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Atualize as informações do produto.' : 'Cadastre um novo produto no sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Perfume Kaiak Masculino"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="789123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo</Label>
              <Input
                id="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => 
                setFormData({ ...formData, category: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Product['status']) => 
                setFormData({ ...formData, status: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {product ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};