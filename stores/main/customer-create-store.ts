import { Customer } from '@/pages/api/main/customers/customer-crud/type';
import { create } from 'zustand';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  selectedCustomer: null,
  addCustomer: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
    })),
  updateCustomer: (customer) =>
    set((state) => ({
      customers: state.customers.map((c) => 
        c.CustomerKey === customer.CustomerKey ? customer : c
      ),
    })),
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
}));
