// Tahsilat işlemi için model
export interface CollectionRequest {
    // Zorunlu alanlar
    // Not: customerKey, customerName ve cardNumber alanlarından en az biri gereklidir.
    // Birden fazla tanımlayıcı da gönderilebilir.
    customerKey?: string;
    amount: number;
    apiKey: string;
    customerName?: string;
    cardNumber?: string;
  
    // İsteğe bağlı alanlar
    description?: string;
    branchID?: number;
    paymentKey?: string;
    orderKey?: string;
    bonusEarned?: number;
    bonusUsed?: number;
    lineDeleted?: number;
    transactionType?: string;
    addDateTime?: string;
    editDateTime?: string;
    bonusTransactionKey?: string;
  }
  
  // Tahsilat işlemi yanıtı için model
  export interface CollectionResponse {
    success: boolean;
    message: string;
    transactionId?: number;
    error?: string | {
      message: string;
      stack?: string;
    };
    bonusInfo?: {
      BonusStartupValue: number;
      TotalBonusUsed: number;
      TotalBonusEarned: number;
      TotalBonusRemaing: number;
    };
  }
  
  // Müşteri bilgileri için model
  export interface CustomerInfo {
    CustomerName?: string;
    CardNumber?: string;
    CustomerKey?: string;
  }
  
  // SQL sorgu sonucu için model
  export interface SqlResult {
    AutoID: number;
    IsSuccess: boolean;
    Message: string;
  }