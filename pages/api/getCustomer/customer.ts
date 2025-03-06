// Müşteri getirme isteği için model
export interface CustomerRequest {
  customerKey: string;
  apiKey: string;
  customerName?: string;
  cardNumber?: string;
}

// Müşteri yanıtı için model
export interface CustomerResponse {
  success: boolean;
  message?: string;
  error?: string | {
    message: string;
    stack?: string;
  };
  customerInfo?: {
    CustomerKey: string;
    CustomerName: string;
    CustomerFullName?: string;
    BranchID?: number;
    BonusStartupValue?: number;
    TotalBonusUsed?: number;
    TotalBonusEarned?: number;
    TotalBonusRemaing?: number;
    PhoneNumber?: string;
    TaxNumber?: string;
    TaxOfficeName?: string;
    AddressNotes?: string;
    BirthDay?: string;
    Age?: number;
    MaritialStatus?: 'single' | 'married' | 'unknown';
    Sexuality?: 'male' | 'female' | 'unknown';
    EmailAddress?: string;
    FacebookAccount?: string;
    TwitterAccount?: string;
    WebSite?: string;
    CreditLimit?: number;
    CreditSatusID?: 'active' | 'passive' | 'blocked' | 'unknown';
    DiscountPercent?: number;
    SpecialBonusPercent?: number;
    CardNumber?: string;
    CardType?: 'meal' | 'gift' | 'corporate' | 'unknown';
    ProximityCardID?: string;
    CustomerSpecialNotes?: string;
  };
}
