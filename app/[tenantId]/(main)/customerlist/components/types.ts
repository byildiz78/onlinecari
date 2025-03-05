import { Customer } from "@/pages/api/main/customers/customer-crud/type"

export interface CustomerFormData {
  // Müşteri Kartı
  name: string;
  fullName: string;
  phone: string;
  taxNumber: string;
  taxOffice: string;
  isActive: boolean;

  // Adres
  address: string;

  // Diğer Bilgiler
  birthDate: string;
  age: string;
  maritalStatus: string;
  gender: string;
  email: string;
  facebook: string;
  twitter: string;
  website: string;

  // Kredi ve Bakiye Bilgileri
  creditLimit: string;
  creditStatus: string;
  discount: string;
  totalPayment: string;
  remainingDebt: string;
  
  // Para Puan Bilgileri
  pointPercentage: string;
  pointStartDate: string;
  earned: string;
  spent: string;
  balance: string;

  // Kart Bilgileri
  customerCard: string;
  cardType: string;
  proximityCardId: string;

  // Müşteri Özel Not
  notes: string;
}

export interface SectionProps {
  customerData: CustomerFormData;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
}
