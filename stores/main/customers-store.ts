import { Customer } from '@/pages/api/main/customers/type';
import { create } from 'zustand';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  updateCustomerBalance: (customerKey: string, amount: number, isDebit: boolean) => void;
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  deleteCustomer: (CustomerID: number) => void;
}

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  selectedCustomer: null,
  addCustomer: (customer) =>
    set((state) => ({       
      customers: [customer, ...state.customers],
    })),
  updateCustomer: (customer) =>
    set((state) => ({
      customers: state.customers.map((c) => 
        c.CustomerKey === customer.CustomerKey ? { ...c, ...customer } : c
      ),
      selectedCustomer: state.selectedCustomer?.CustomerKey === customer.CustomerKey 
        ? { ...state.selectedCustomer, ...customer } 
        : state.selectedCustomer
    })),
  updateCustomerBalance: (customerKey, amount, isDebit) =>
    set((state) => ({
      customers: state.customers.map((c) => {
        if (c.CustomerKey === customerKey) {
          // Eğer borç ise (satış işlemi)
          if (isDebit) {
            const bonusEarned = amount * (c.SpecialBonusPercent || 0) / 100;
            return {
              ...c,
              TotalBonusEarned: (c.TotalBonusEarned || 0) + bonusEarned,
              TotalBonusRemaing: (c.TotalBonusRemaing || 0) + bonusEarned
            };
          } 
          // Eğer alacak ise (tahsilat işlemi)
          else {
            return {
              ...c,
              TotalBonusUsed: (c.TotalBonusUsed || 0) + amount,
              TotalBonusRemaing: (c.TotalBonusRemaing || 0) - amount
            };
          }
        }
        return c;
      }),
      selectedCustomer: state.selectedCustomer?.CustomerKey === customerKey
        ? isDebit
          ? {
              ...state.selectedCustomer,
              TotalBonusEarned: (state.selectedCustomer.TotalBonusEarned || 0) + (amount * (state.selectedCustomer.SpecialBonusPercent || 0) / 100),
              TotalBonusRemaing: (state.selectedCustomer.TotalBonusRemaing || 0) + (amount * (state.selectedCustomer.SpecialBonusPercent || 0) / 100)
            }
          : {
              ...state.selectedCustomer,
              TotalBonusUsed: (state.selectedCustomer.TotalBonusUsed || 0) + amount,
              TotalBonusRemaing: (state.selectedCustomer.TotalBonusRemaing || 0) - amount
            }
        : state.selectedCustomer
    })),
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  deleteCustomer: (CustomerID) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.CustomerID !== CustomerID),
      selectedCustomer: state.selectedCustomer?.CustomerID === CustomerID ? null : state.selectedCustomer
    })),
}));
