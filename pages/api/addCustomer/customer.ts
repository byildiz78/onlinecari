export interface CustomerRequest {
    apiKey: string;
  

    // Add new properties here
    autoID?: number;
    customerID?: number;
    customerKey?: string; // uniqueidentifier in SQL becomes string in TS
    customerGlobalKey?: string;
    customerIsActive?: boolean; // bit in SQL becomes boolean in TS
    customerName?: string; // nvarchar becomes string
    customerFullName?: string;
    cardNumber?: string;
    phoneNumber?: string;
    customerNotes?: string;
    orderCount?: number;
    lastCallDate?: Date; // datetime becomes Date
    callingCount?: number;
    allowHouseAccount?: boolean;
    isFrequentDiner?: boolean;
    creditLimit?: number; // float becomes number
    creditSatusID?: number;
    discountPercent?: number;
    specialBonusPercent?: number;
    totalDebt?: number;
    totalPayment?: number;
    totalRemainig?: number; // note: typo from original (should be "Remaining")
    bonusStartupValue?: number;
    totalBonusUsed?: number;
    totalBonusEarned?: number;
    totalBonusRemaing?: number; // note: typo from original
    cityName?: string;
    district?: string;
    neighborhood?: string;
    avenue?: string;
    street?: string;
    buildings?: string;
    block?: string;
    apartment?: string;
    apartmentNo?: string;
    flatNo?: string;
    isDefault?: boolean;
    taxOfficeName?: string;
    taxNumber?: string;
    zipCode?: string;
    addressNotes?: string;
    areaCode?: string;
    customerSpecialNotes?: string;
    birthDay?: Date;
    maritialStatus?: number; // note: typo from original (should be "Marital")
    age?: number;
    emailAddress?: string;
    sexuality?: number;
    facebookAccount?: string;
    twitterAccount?: string;
    webSite?: string;
    photoPath?: string;
    proximityCardID?: string;
    editKey?: string;
    syncKey?: string;
    branchID?: number;
    lockData?: boolean;
    lockStationID?: number;
    addUserID?: number;
    addDateTime?: Date;
    editUserID?: number;
    editDateTime?: Date;
    webUserName?: string;
    webPassword?: string;
    openValue?: number;
    cardType?: string;
    lastTransactionTime?: Date;
    // Add new properties here
  }