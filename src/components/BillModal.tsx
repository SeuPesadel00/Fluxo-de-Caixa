import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Supplier } from '@/types';
import { FileText, AlertCircle } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillModal = ({ isOpen, onClose }: BillModalProps) => {
  const { suppliers, addBill } = useAppContext();
  const [formData, setFormData] = useState({
    supplier_id: '',
    description: '',
    total_value: '',
    issue_date: new Date().toISOString().split('T')[0],
    first_due_date: new Date().toISOString().split('T')[0],
    installments_count: '1'
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um fornecedor.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Erro',
        description: 'Descrição é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.total_value || parseFloat(formData.total_value) <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    const supplier = suppliers.find(s => s.id === formData.supplier_id);
    if (!supplier) {
      toast({
        title: 'Erro',
        description: 'Fornecedor não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    addBill({
      supplier_id: formData.supplier_id,
      supplier_name: supplier.name,
      description: formData.description.trim(),
      total_value: parseFloat(formData.total_value),
      issue_date: formData.issue_date,
      first_due_date: formData.first_due_date,
      installments_count: parseInt(formData.installments_count),
    });

    toast({
      title: 'Sucesso',
      description: `Conta cadastrada com ${formData.installments_count} parcela(s)!`,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      supplier_id: '',
      description: '',
      total_value: '',
      issue_date: new Date().toISOString().split('T')[0],
      first_due_date: new Date().toISOString().split('T')[0],
      installments_count: '1'
    });
    onClose();
  };

  const installmentValue = formData.total_value ? 
    (parseFloat(formData.total_value) / parseInt(formData.installments_count)).toFixed(2) : '0.00';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Conta a Pagar
          </DialogTitle>
          <DialogDescription>
            Registre uma nova conta ou boleto de fornecedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor *</Label>
            <Select value={formData.supplier_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, supplier_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier: Supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ex: Compra de matéria-prima, Aluguel, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_value">Valor Total *</Label>
              <Input
                id="total_value"
                name="total_value"
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={handleInputChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments_count">Nº de Parcelas *</Label>
              <Select value={formData.installments_count} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, installments_count: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Data de Emissão</Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_due_date">Vencimento 1ª Parcela *</Label>
              <Input
                id="first_due_date"
                name="first_due_date"
                type="date"
                value={formData.first_due_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Preview das Parcelas */}
          {formData.total_value && parseInt(formData.installments_count) > 1 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Preview das Parcelas:</p>
              <p className="text-sm text-muted-foreground">
                {formData.installments_count} parcelas de R$ {installmentValue}
              </p>
            </div>
          )}

          {/* Alertas */}
          {suppliers.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                Nenhum fornecedor cadastrado. Cadastre fornecedores antes de criar contas.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={suppliers.length === 0}
              className="bg-gradient-primary"
            >
              Cadastrar Conta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};