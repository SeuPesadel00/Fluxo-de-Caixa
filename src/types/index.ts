// Interface para transações financeiras pessoais
export interface PersonalTransaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  category: string;
  transaction_date: string;
  payment_method?: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
  credit_card?: string;
  bank?: string;
  due_date?: string;
  installments?: number;
  current_installment?: number;
}

// Interface para produtos
export interface Product {
  id: string;
  name: string;
  barcode: string;
  description?: string;
  sale_price: number;
  cost_price?: number;
  stock_quantity: number;
  minimum_stock?: number;
  category?: string;
  status: 'ativo' | 'inativo';
  created_date: string;
}

// Interface para clientes
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  current_debt: number; // Saldo devedor atual
  created_date: string;
}

// Interface para pagamentos de vendas
export interface SalePayment {
  id: string;
  sale_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
}

// Interface para itens de venda (produtos vendidos)
export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Interface para as vendas de produtos
export interface Sale {
  id: string;
  customer_id: string;
  items: SaleItem[];
  total_value: number;
  profit: number;
  sale_date: string;
  payment_type: 'vista' | 'parcelado';
  installments: number;
  installment_value: number;
  payments: SalePayment[];
  status: 'pendente' | 'parcial' | 'quitado';
}

// Interface para as anotações do usuário
export interface Note {
  content: string;
  updated_at: string;
}

// Interface para filtros de período
export interface PeriodFilter {
  type: 'diario' | 'semanal' | 'mensal';
  startDate: string;
  endDate: string;
}

// Interface para pagamentos de clientes (quitação de dívidas)
export interface CustomerPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
  description?: string;
}

// Interface para fornecedores
export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_date: string;
}

// Interface para contas/boletos
export interface Bill {
  id: string;
  supplier_id: string;
  supplier_name: string;
  description: string;
  total_value: number;
  issue_date: string;
  first_due_date: string;
  installments_count: number;
  attachment?: string;
  created_date: string;
}

// Interface para parcelas das contas
export interface BillInstallment {
  id: string;
  bill_id: string;
  supplier_name: string;
  description: string;
  installment_number: number;
  total_installments: number;
  value: number;
  due_date: string;
  status: 'a_pagar' | 'paga' | 'vencida';
  payment_date?: string;
  created_date: string;
}

// Interface para o contexto da aplicação
export interface AppContextType {
  isAuthenticated: boolean;
  personalTransactions: PersonalTransaction[];
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  customerPayments: CustomerPayment[];
  suppliers: Supplier[];
  bills: Bill[];
  billInstallments: BillInstallment[];
  notes: Note;
  periodFilter: PeriodFilter;
  login: () => void;
  logout: () => void;
  addTransaction: (transaction: Omit<PersonalTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addSale: (saleData: { customer_id: string; items: Omit<SaleItem, 'id' | 'total_price'>[] }) => void;
  deleteSale: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_date' | 'current_debt'>) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_date'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  addSalePayment: (saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>) => void;
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id'>) => void;
  getCustomerPurchaseHistory: (customerId: string) => Sale[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_date'>) => void;
  deleteSupplier: (id: string) => void;
  addBill: (billData: Omit<Bill, 'id' | 'created_date'>) => void;
  deleteBill: (id: string) => void;
  payBillInstallment: (installmentId: string) => void;
  getBillInstallmentsByStatus: (status?: BillInstallment['status']) => BillInstallment[];
  updateNotes: (content: string) => void;
  setPeriodFilter: (filter: PeriodFilter) => void;
  clearAllData: () => void;
}