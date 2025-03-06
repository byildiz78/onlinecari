export interface TransactionUpdateRequest {
    apiKey: string;
    // Required identifiers (at least one must be provided)
    customerKey?: string;
    cardNumber?: string; // CardNo in the table
    customerName?: string;
    
    // Transaction fields that can be updated
    paymentKey?: string;
    orderKey?: string;
    amountDue?: number;
    bonusUsed?: number;
    bonusEarned?: number;
    lineDeleted?: boolean;
    customField1?: string;
    customField2?: string;
    customField3?: string;
    customField4?: string;
    customField5?: string;
    branchID?: number;
}
