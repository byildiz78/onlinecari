import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { CustomerDetailRequest, CustomerDetailResponse } from './detail';

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
        const tenantIdQuery = `Select tenantName from bonus_poscompanies Where companyKey = '${apiKey}'`;
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
        const query = `
        -- Geçici tablo kullanarak önce müşteriyi bul
        SELECT TOP 1 *
        INTO #CustomerInfo
        FROM [${tenantId}].bonus_customerfiles
        WHERE CustomerIsActive = 1
        AND (
            (@CustomerKey <> '' AND TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey) IS NOT NULL AND CustomerKey = TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey)) OR
            (@CardNumber <> '' AND CardNumber = @CardNumber) OR
            (@CustomerName <> '' AND CustomerName = @CustomerName)
        );

        -- Müşteri bilgisini JSON olarak al
        DECLARE @CustomerJson NVARCHAR(MAX);
        DECLARE @TransactionsJson NVARCHAR(MAX);
        DECLARE @PeriodBalanceValue VARCHAR(50);

        -- Müşteri JSON
        SET @CustomerJson = (
            SELECT 
                CustomerName AS customerName,
                CardNumber AS cardNo,
                ROUND(TotalBonusRemaing*-1, 2) AS balance
            FROM 
                #CustomerInfo
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        -- Önce işlem tablosunu oluştur (sütun boyutlarını açıkça belirt)
        CREATE TABLE #Transactions (
            date NVARCHAR(50),
            description NVARCHAR(500),
            amount NVARCHAR(100),
            type NVARCHAR(50),
            checkNo NVARCHAR(100),
            actualValue DECIMAL(18,4),
            sortDate DATETIME
        );

        -- Normal işlemleri ekle
        INSERT INTO #Transactions
        SELECT
            CONVERT(varchar, t.OrderDateTime, 104) AS date,
            CASE
                WHEN t.CustomField2 = 'BAKİYE YÜKLEME' THEN 'Bakiye Yükleme'
                ELSE COALESCE(t.CustomField2, 'İşlem')
            END AS description,
            CONVERT(VARCHAR(100), ABS(ROUND(CASE
                WHEN t.BonusEarned <> 0 THEN t.BonusEarned
                ELSE t.BonusUsed
            END, 2))) AS amount,
            CASE
                WHEN t.BonusEarned <> 0 THEN 'credit'
                ELSE 'debt'
            END AS type,
            ISNULL(t.CustomField1, '') AS checkNo,
            CASE
                WHEN t.BonusEarned <> 0 THEN ROUND(t.BonusEarned, 2)
                ELSE -ROUND(t.BonusUsed, 2)
            END AS actualValue,
            t.OrderDateTime AS sortDate
        FROM
            [${tenantId}].bonus_transactions AS t
        WHERE
            t.CustomerKey = (SELECT TOP 1 CustomerKey FROM #CustomerInfo)
            AND t.LineDeleted = 0
            AND t.OrderDateTime BETWEEN @date1 AND @date2
            AND t.CustomField2 NOT LIKE '%ORDER%';

        -- Açılış bakiyesini ayrı olarak ekle
        INSERT INTO #Transactions
        SELECT
            convert(varchar, b.AddDateTime, 104) AS date,
            'AÇILIŞ BAKİYESİ' AS description,
            CONVERT(VARCHAR(100), b.BonusStartupValue) AS amount,
            'startupcredit' AS type,
            '' AS checkNo,
            b.BonusStartupValue AS actualValue,
            b.AddDateTime AS sortDate
        FROM
            #CustomerInfo b
        WHERE
            b.BonusStartupValue > 0;

        -- İşlem JSON'ı oluştur
        SET @TransactionsJson = (
            SELECT 
                date, 
                description, 
                amount, 
                type, 
                checkNo
            FROM 
                #Transactions
            ORDER BY 
                sortDate DESC
            FOR JSON PATH
        );

        -- Dönem bakiyesi hesapla
        SET @PeriodBalanceValue = (
            SELECT CONVERT(VARCHAR(50), ISNULL(SUM(actualValue), 0))
            FROM #Transactions
        );

        -- JSON sonucunu birleştir ve döndür
        SELECT CONCAT(
            '{',
            '"customer":', ISNULL(@CustomerJson, '{}'),
            ',"transactions":', ISNULL(@TransactionsJson, '[]'),
            ',"periodBalance":"', @PeriodBalanceValue, '"',
            '}'
        ) AS JsonResult;

        -- Geçici tabloları temizle
        DROP TABLE #CustomerInfo;
        DROP TABLE #Transactions;
    `;

        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<any[]>({
            query,
            parameters: {
                CustomerKey: customerKey?.toString() || '',
                CardNumber: cardNumber?.toString() || '',
                CustomerName: customerName?.toString() || '',
                date1: formattedStartDate,
                date2: formattedEndDate
            },
            tenantId: tenantId,
            req,
        });

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Müşteri bulunamadı',
                error: 'Müşteri bulunamadı'
            });
        }

        const sqlJsonResult = result[0].JsonResult;
        const parsedCustomerInfo = JSON.parse(sqlJsonResult);

        // Başarılı yanıt döndür
        return res.status(200).json({
            success: true,
            message: "Müşteri bilgileri başarıyla getirildi",
            customerInfo: parsedCustomerInfo // Artık string değil, JSON objesi
        });

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
