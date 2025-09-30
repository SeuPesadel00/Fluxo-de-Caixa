import { PersonalTransaction, Sale, Note, Customer } from '@/types';

// Dados limpos - usuário vai inserir tudo do zero
export const mockPersonalTransactions: PersonalTransaction[] = [];

export const mockSales: Sale[] = [];

export const mockCustomers: Customer[] = [];

export const mockNote: Note = {
  content: '',
  updated_at: new Date().toISOString()
};