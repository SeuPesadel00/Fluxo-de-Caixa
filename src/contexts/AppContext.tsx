import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, PersonalTransaction, Sale, Customer, Product, CustomerPayment, Note, PeriodFilter, SalePayment, SaleItem, Supplier, Bill, BillInstallment } from '@/types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalTransactions, setPersonalTransactions] = useState<PersonalTransaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billInstallments, setBillInstallments] = useState<BillInstallment[]>([]);
  const [notes, setNotes] = useState<Note>({ content: '', updated_at: new Date().toISOString() });
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    type: 'mensal',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
  });

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addTransaction = (transaction: Omit<PersonalTransaction, 'id'>) => {
    const newTransaction: PersonalTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setPersonalTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setPersonalTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSale = (saleData: { customer_id: string; items: Omit<SaleItem, 'id' | 'total_price'>[] }) => {
    // Calcular totais e criar itens da venda
    const saleItems: SaleItem[] = saleData.items.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      total_price: item.quantity * item.unit_price
    }));

    const totalValue = saleItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Calcular lucro baseado no preço de custo dos produtos
    const totalCost = saleItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.cost_price || 0) * item.quantity;
    }, 0);

    const newSale: Sale = {
      id: Date.now().toString(),
      customer_id: saleData.customer_id,
      items: saleItems,
      total_value: totalValue,
      profit: totalValue - totalCost,
      sale_date: new Date().toISOString(),
      payment_type: 'vista', // Padrão, pode ser editado depois
      installments: 1,
      installment_value: totalValue,
      payments: [],
      status: 'pendente'
    };

    setSales(prev => [newSale, ...prev]);

    // Atualizar estoque dos produtos
    saleItems.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.product_id 
          ? { ...product, stock_quantity: product.stock_quantity - item.quantity }
          : product
      ));
    });

    // Atualizar saldo devedor do cliente
    setCustomers(prev => prev.map(customer => 
      customer.id === saleData.customer_id 
        ? { ...customer, current_debt: customer.current_debt + totalValue }
        : customer
    ));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'created_date' | 'current_debt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      current_debt: 0,
      created_date: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    // Remove vendas associadas ao cliente
    setSales(prev => prev.filter(s => s.customer_id !== id));
    // Remove pagamentos do cliente
    setCustomerPayments(prev => prev.filter(p => p.customer_id !== id));
  };

  const addProduct = (product: Omit<Product, 'id' | 'created_date'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updatedProduct } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode && product.status === 'ativo');
  };

  const addSalePayment = (saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>) => {
    const newPayment: SalePayment = {
      ...payment,
      id: Date.now().toString(),
      sale_id: saleId,
    };

    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const updatedPayments = [...sale.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let status: 'pendente' | 'parcial' | 'quitado' = 'pendente';
        if (totalPaid >= sale.total_value) {
          status = 'quitado';
        } else if (totalPaid > 0) {
          status = 'parcial';
        }

        return {
          ...sale,
          payments: updatedPayments,
          status
        };
      }
      return sale;
    }));
  };

  const addCustomerPayment = (payment: Omit<CustomerPayment, 'id'>) => {
    const newPayment: CustomerPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    
    setCustomerPayments(prev => [newPayment, ...prev]);
    
    // Reduzir saldo devedor do cliente
    setCustomers(prev => prev.map(customer => 
      customer.id === payment.customer_id 
        ? { ...customer, current_debt: Math.max(0, customer.current_debt - payment.amount) }
        : customer
    ));
  };

  const getCustomerPurchaseHistory = (customerId: string): Sale[] => {
    return sales.filter(sale => sale.customer_id === customerId);
  };

  const updateNotes = (content: string) => {
    setNotes({
      content,
      updated_at: new Date().toISOString(),
    });
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'created_date'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    // Remove contas associadas ao fornecedor
    setBills(prev => prev.filter(b => b.supplier_id !== id));
    setBillInstallments(prev => prev.filter(i => {
      const bill = bills.find(b => b.id === i.bill_id);
      return bill?.supplier_id !== id;
    }));
  };

  const addBill = (billData: Omit<Bill, 'id' | 'created_date'>) => {
    const newBill: Bill = {
      ...billData,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };

    setBills(prev => [newBill, ...prev]);

    // Gerar parcelas automaticamente
    const installments: BillInstallment[] = [];
    const installmentValue = billData.total_value / billData.installments_count;
    
    for (let i = 0; i < billData.installments_count; i++) {
      const dueDate = new Date(billData.first_due_date);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      const currentDate = new Date();
      let status: BillInstallment['status'] = 'a_pagar';
      if (dueDate < currentDate) {
        status = 'vencida';
      }

      const installment: BillInstallment = {
        id: `${newBill.id}-${i + 1}`,
        bill_id: newBill.id,
        supplier_name: billData.supplier_name,
        description: billData.description,
        installment_number: i + 1,
        total_installments: billData.installments_count,
        value: installmentValue,
        due_date: dueDate.toISOString(),
        status,
        created_date: new Date().toISOString(),
      };
      
      installments.push(installment);
    }

    setBillInstallments(prev => [...installments, ...prev]);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    setBillInstallments(prev => prev.filter(i => i.bill_id !== id));
  };

  const payBillInstallment = (installmentId: string) => {
    setBillInstallments(prev => prev.map(installment => 
      installment.id === installmentId 
        ? { 
            ...installment, 
            status: 'paga' as const, 
            payment_date: new Date().toISOString() 
          }
        : installment
    ));
  };

  const getBillInstallmentsByStatus = (status?: BillInstallment['status']): BillInstallment[] => {
    if (!status) return billInstallments;
    return billInstallments.filter(installment => installment.status === status);
  };

  // Atualizar status das parcelas vencidas automaticamente
  useEffect(() => {
    const updateOverdueInstallments = () => {
      const currentDate = new Date();
      setBillInstallments(prev => prev.map(installment => {
        if (installment.status === 'a_pagar' && new Date(installment.due_date) < currentDate) {
          return { ...installment, status: 'vencida' as const };
        }
        return installment;
      }));
    };

    updateOverdueInstallments();
    
    // Verificar a cada hora
    const interval = setInterval(updateOverdueInstallments, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const clearAllData = () => {
    setPersonalTransactions([]);
    setSales([]);
    setCustomers([]);
    setProducts([]);
    setCustomerPayments([]);
    setSuppliers([]);
    setBills([]);
    setBillInstallments([]);
    setNotes({ content: '', updated_at: new Date().toISOString() });
  };

  const value: AppContextType = {
    isAuthenticated,
    personalTransactions,
    sales,
    customers,
    products,
    customerPayments,
    suppliers,
    bills,
    billInstallments,
    notes,
    periodFilter,
    login,
    logout,
    addTransaction,
    deleteTransaction,
    addSale,
    deleteSale,
    addCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    addSalePayment,
    addCustomerPayment,
    getCustomerPurchaseHistory,
    addSupplier,
    deleteSupplier,
    addBill,
    deleteBill,
    payBillInstallment,
    getBillInstallmentsByStatus,
    updateNotes,
    setPeriodFilter,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};