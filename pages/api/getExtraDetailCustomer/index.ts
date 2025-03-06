import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { CustomerDetailRequest, CustomerDetailResponse } from './extradetail';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CustomerDetailResponse>
) {
    // Sadece POST isteklerini kabul ediyoruz
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed',
            error: 'Method not allowed'
        });
    }

    // Body'den CustomerKey değerini alıyoruz
    const customerRequest: CustomerDetailRequest = req.body;
    const { customerKey, apiKey, customerName, cardNumber, date1, date2 } = customerRequest;

    // Varsayılan tarih değerlerini hesapla
    const today = new Date();
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Kullanıcı tarafından gönderilen veya varsayılan tarihleri kullan
    const startDate = date1 ? new Date(date1) : lastMonthStart;
    const endDate = date2 ? new Date(date2) : today;

    // Tarihleri ISO formatına dönüştür
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    // API key kontrolü
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir apiKey gereklidir',
            error: 'Body içerisinde geçerli bir apiKey gereklidir'
        });
    }

    // En az bir tanımlayıcı (customerKey, customerName, cardNumber) olup olmadığını kontrol et
    const hasCustomerKey = customerKey && typeof customerKey === 'string';
    const hasCustomerName = customerName && typeof customerName === 'string';
    const hasCardNumber = cardNumber && typeof cardNumber === 'string';

    if (!hasCustomerKey && !hasCustomerName && !hasCardNumber) {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir CustomerKey, CustomerName veya CardNumber değerlerinden en az biri gereklidir',
            error: 'Body içerisinde geçerli bir CustomerKey, CustomerName veya CardNumber değerlerinden en az biri gereklidir'
        });
    }

    let tenantId = ""; // Tenant ID'yi saklamak için değişken tanımlıyoruz
    try {
        const tenantIdQuery = `Select tenantName from bonus_poscompanies Where companyKey = @ApiKey`;
        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<any>({
            query: tenantIdQuery,
            parameters: {
                ApiKey: apiKey
            },
            tenantId: "donerciali",
            req,
        });

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tenant bulunamadı',
                error: 'Tenant bulunamadı'
            });
        }

        tenantId = result[0].tenantName;

    } catch (error) {
        console.error('Tenant id getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Bilinmeyen hata'
        });
    }

    try {
        // Müşteri bilgilerini ayrı bir sorgu ile al
        const customerQuery = `
        SELECT TOP 1
            CustomerName AS customerName,
            CardNumber AS cardNo,
            ROUND(TotalBonusRemaing*-1, 2) AS balance,
            CustomerKey
        FROM [${tenantId}].bonus_customerfiles
        WHERE CustomerIsActive = 1
        AND (
            (@CustomerKey <> '' AND TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey) IS NOT NULL AND CustomerKey = TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey)) OR
            (@CardNumber <> '' AND CardNumber = @CardNumber) OR
            (@CustomerName <> '' AND CustomerName = @CustomerName)
        )
        `;

        const customerResult = await Dataset.getInstance().executeQuery({
            query: customerQuery,
            parameters: {
                CustomerKey: customerKey?.toString() || '',
                CardNumber: cardNumber?.toString() || '',
                CustomerName: customerName?.toString() || ''
            },
            tenantId: tenantId,
            req,
        });

        if (!customerResult || customerResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Müşteri bulunamadı',
                error: 'Müşteri bulunamadı'
            });
        }

        const customer = customerResult[0];
        const foundCustomerKey = customer.CustomerKey;

        // İşlemleri ve sipariş detaylarını al
        const transactionsQuery = `
        WITH TransactionList AS (
            -- Normal işlemler
            SELECT
                CONVERT(varchar, t.OrderDateTime, 104) AS date,
                CASE
                    WHEN t.CustomField2 = 'BAKİYE YÜKLEME' THEN 'Bakiye Yükleme'
                    ELSE COALESCE(t.CustomField2, 'İşlem')
                END AS description,
                CONVERT(VARCHAR(20), ABS(ROUND(CASE
                    WHEN t.BonusEarned <> 0 THEN t.BonusEarned
                    ELSE t.BonusUsed
                END, 2))) AS amount,
                CASE
                    WHEN t.BonusEarned <> 0 THEN 'credit'
                    ELSE 'debt'
                END AS type,
                t.CustomField1 AS checkNo,
                t.OrderKey AS orderKey,
                -- İşlem değeri (hesaplama için)
                CASE
                    WHEN t.BonusEarned <> 0 THEN ROUND(t.BonusEarned, 2)
                    ELSE -ROUND(t.BonusUsed, 2)
                END AS actualValue,
                t.OrderDateTime AS orderDate
            FROM
                [${tenantId}].bonus_transactions AS t
            WHERE
                t.CustomerKey = @CustomerKey
                AND t.LineDeleted = 0
                AND t.OrderDateTime BETWEEN @date1 AND @date2
                AND t.CustomField2 NOT LIKE '%ORDER%'
            
            UNION ALL
            
            -- Açılış bakiyesi (eğer varsa)
            SELECT
                convert(varchar, b.AddDateTime, 104) AS date,
                'AÇILIŞ BAKİYESİ' AS description,
                CONVERT(VARCHAR(20), b.BonusStartupValue) AS amount,
                'startupcredit' AS type,
                '' AS checkNo,
                NULL AS orderKey,
                b.BonusStartupValue AS actualValue,
                b.AddDateTime AS orderDate
            FROM
                [${tenantId}].bonus_customerfiles AS b
            WHERE
                b.CustomerKey = @CustomerKey
                AND b.BonusStartupValue > 0
        ),
        OrderTransactionDetails AS (
            SELECT
                ot.OrderKey,
                (
                    SELECT
                        ot2.MenuItemText AS menuItemText,
                        ot2.MenuItemUnitPrice AS menuItemUnitPrice,
                        ot2.Quantity AS quantity,
                        ot2.ExtendedPrice AS extendedPrice,
                        ROUND(ISNULL(ot2.DiscountLineAmount, 0) + ISNULL(ot2.DiscountCashAmount, 0), 2) AS discountAmount,
                        ROUND((ot2.Quantity * ot2.MenuItemUnitPrice), 2) AS netAmount
                    FROM
                        [${tenantId}].bonus_ordertransactions ot2
                    WHERE
                        ot2.OrderKey = ot.OrderKey
                    FOR JSON PATH
                ) AS orderItems
            FROM
                [${tenantId}].bonus_ordertransactions ot
            INNER JOIN
                TransactionList tl ON ot.OrderKey = tl.orderKey
            GROUP BY
                ot.OrderKey
        )
        SELECT 
            tl.date,
            tl.description,
            tl.amount,
            tl.type,
            tl.checkNo,
            CASE 
                WHEN otd.orderItems IS NULL THEN '[]'
                ELSE otd.orderItems
            END AS orderItems,
            tl.actualValue
        FROM 
            TransactionList tl
        LEFT JOIN
            OrderTransactionDetails otd ON tl.orderKey = otd.OrderKey
        ORDER BY 
            CASE WHEN tl.description = 'AÇILIŞ BAKİYESİ' THEN 0 ELSE 1 END,
            tl.orderDate DESC
        `;

        const transactionsResult = await Dataset.getInstance().executeQuery({
            query: transactionsQuery,
            parameters: {
                CustomerKey: foundCustomerKey,
                date1: formattedStartDate,
                date2: formattedEndDate
            },
            tenantId: tenantId,
            req,
        });

        // Dönem bakiyesini hesapla
        let periodBalance = 0;
        const transactions = [];

        if (transactionsResult && transactionsResult.length > 0) {
            for (const transaction of transactionsResult) {
                // Dönem bakiyesine ekle
                periodBalance += transaction.actualValue || 0;

                // OrderItems'ı JSON objesine dönüştür
                let orderItems = [];
                if (transaction.orderItems && transaction.orderItems !== '[]') {
                    try {
                        orderItems = JSON.parse(transaction.orderItems);
                    } catch (e) {
                        console.error('JSON parse error for orderItems:', e);
                    }
                }

                // Temiz işlem objesini oluştur (actualValue'yu çıkar)
                const { actualValue, ...cleanTransaction } = transaction;
                transactions.push({
                    ...cleanTransaction,
                    orderItems
                });
            }
        }

        // Yanıtı oluştur
        const response = {
            success: true,
            message: "Müşteri bilgileri başarıyla getirildi",
            customerInfo: {
                customer: {
                    customerName: customer.customerName,
                    cardNo: customer.cardNo,
                    balance: customer.balance
                },
                transactions: transactions,
                periodBalance: periodBalance.toString()
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Müşteri getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Müşteri bilgileri getirilirken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Bilinmeyen hata'
        });
    }
}