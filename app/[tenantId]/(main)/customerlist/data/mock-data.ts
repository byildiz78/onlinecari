// Örnek müşteri verileri
export const customers = [
    {
        id: "1",
        cardNo: "10000",
        cardType: "Yemek Kartı",
        name: "PERS-AYDIN TANERGİN",
        branch: "MALTEPE",
        balance: 1500.50,
        credit: 2000.00,
        debt: 500.00,
        status: "active"
    },
    {
        id: "2",
        cardNo: "30000",
        cardType: "Yemek Kartı",
        name: "PERS-SÜLEYMAN YENER",
        branch: "MALTEPE",
        balance: -291874.89,
        credit: 290737.00,
        debt: 11499.95,
        status: "active"
    },
    {
        id: "3",
        cardNo: "100000",
        cardType: "Yemek Kartı",
        name: "PERS-SELİM YÜCEL",
        branch: "MALTEPE",
        balance: -11867.14,
        credit: 5802.25,
        debt: 5780.24,
        status: "active"
    }
];

// Örnek statü seçenekleri
export const statusOptions = [
    { value: "all", label: "Tüm Durumlar" },
    { value: "active", label: "Aktif" },
    { value: "passive", label: "Pasif" },
    { value: "blocked", label: "Bloke" }
];

// Örnek tip seçenekleri
export const typeOptions = [
    { value: "all", label: "Tüm Tipler" },
    { value: "meal", label: "Yemek Kartı" },
    { value: "gift", label: "Hediye Kartı" },
    { value: "corporate", label: "Kurumsal" }
];

// Mock ekstre verisi
export const mockStatementData = [
    { date: "01.06.2023", description: "Satış Faturası", amount: 1500.00, type: "debt" },
    { date: "05.06.2023", description: "Tahsilat", amount: 1200.00, type: "credit" },
    { date: "12.06.2023", description: "Satış Faturası", amount: 2300.00, type: "debt" },
    { date: "18.06.2023", description: "Tahsilat", amount: 1800.00, type: "credit" },
    { date: "25.06.2023", description: "Satış Faturası", amount: 1750.00, type: "debt" },
];

// Mock detaylı ekstre verisi
export const mockDetailedStatementData = [
    { date: "01.06.2023", documentNo: "SF-2023/0001", description: "Satış Faturası", amount: 1500.00, type: "debt", userCode: "ADMIN" },
    { date: "05.06.2023", documentNo: "TH-2023/0001", description: "Tahsilat", amount: 1200.00, type: "credit", userCode: "ADMIN" },
    { date: "12.06.2023", documentNo: "SF-2023/0002", description: "Satış Faturası", amount: 2300.00, type: "debt", userCode: "SATIS01" },
    { date: "18.06.2023", documentNo: "TH-2023/0002", description: "Tahsilat", amount: 1800.00, type: "credit", userCode: "ADMIN" },
    { date: "25.06.2023", documentNo: "SF-2023/0003", description: "Satış Faturası", amount: 1750.00, type: "debt", userCode: "SATIS02" },
];
