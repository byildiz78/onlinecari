export interface Customer {
    CustomerKey: string;
    CustomerName: string;
    CustomerFullName?: string;
    PhoneNumber?: string;
    TaxNumber?: string;
    TaxOfficeName?: string;
    AddressNotes?: string;
    BirthDay?: string | null;
    Age?: number;
    MaritialStatus?: number | null;
    Sexuality?: number | null;
    EmailAddress?: string;
    FacebookAccount?: string;
    TwitterAccount?: string;
    WebSite?: string;
    CreditLimit?: number;
    CreditSatusID?: number | null;
    DiscountPercent?: number;
    SpecialBonusPercent?: number;
    BonusStartupValue?: number;
    CardNumber?: string;
    CardType?: string;
    ProximityCardID?: string;
    CustomerSpecialNotes?: string;
    CustomerIsActive?: boolean; // SQL'de BIT (1 veya 0) olarak saklanır
    CustomerNotes?: string;
    LastCallDate?: string;
    CallingCount?: number;
    AllowHouseAccount?: boolean; // SQL'de BIT olarak saklanır
    AllowDelivery?: boolean; // SQL'de BIT olarak saklanır
    AllowCredit?: boolean; // SQL'de BIT olarak saklanır
    IsFrequentDiner?: boolean; // SQL'de BIT olarak saklanır
    TotalDebt?: number;
    TotalPayment?: number;
    TotalRemainig?: number;
    TotalBonusUsed?: number;
    TotalBonusEarned?: number;
    OrderCount?: number;
    TotalBonusRemaing?: number;
    EditKey?: string;
    SyncKey?: string;
    AddDateTime?: string;
    EditDateTime?: string;
    CityName?: string;
    District?: string;
    Neighborhood?: string;
    Avenue?: string;
    Street?: string;
    Buildings?: string;
    Block?: string;
    Apartment?: string;
    ApartmentNo?: string;
    FlatNo?: string;
    IsDefault?: boolean; // SQL'de BIT olarak saklanır
    ZipCode?: string;
    AreaCode?: string;
    PhotoPath?: string;
    WebUserName?: string;
    WebPassword?: string;
    OpenValue?: number;
    CustomerID?: number; // AutoID ile aynı değer olacak
}