import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { CustomerRequest, CustomerResponse } from './customer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CustomerResponse>
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
    const customerRequest: CustomerRequest = req.body;
    const { customerKey, apiKey } = customerRequest;

    if (!customerKey || typeof customerKey !== 'string' || !apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ 
            success: false,
            message: 'Body içerisinde geçerli bir CustomerKey ve apikey gereklidir',
            error: 'Body içerisinde geçerli bir CustomerKey ve apikey gereklidir' 
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
              SELECT DISTINCT
            CustomerKey,
            CustomerName,
            CustomerFullName,
            BranchID,
            BonusStartupValue,
            TotalBonusUsed,
            TotalBonusEarned,
            TotalBonusRemaing,
            PhoneNumber,
            TaxNumber,
            TaxOfficeName,
            AddressNotes,
            BirthDay,
            Age,
            -- MaritialStatus alanını metin değerine dönüştür
            CASE 
                WHEN MaritialStatus = 0 THEN 'single'
                WHEN MaritialStatus = 1 THEN 'married'
                ELSE 'unknown'
            END AS MaritialStatus,
            -- Sexuality alanını metin değerine dönüştür
            CASE 
                WHEN Sexuality = 0 THEN 'male'
                WHEN Sexuality = 1 THEN 'female'
                ELSE 'unknown'
            END AS Sexuality,
            EmailAddress,
            FacebookAccount,
            TwitterAccount,
            WebSite,
            CreditLimit,
            -- CreditStatusID alanını metin değerine dönüştür
            CASE 
                WHEN CreditSatusID = 0 THEN 'active'
                WHEN CreditSatusID = 1 THEN 'passive'
                WHEN CreditSatusID = 2 THEN 'blocked'
                ELSE 'unknown'
            END AS CreditSatusID,
            DiscountPercent,
            SpecialBonusPercent,
            CardNumber,
            -- CardType alanını standardize et
            CASE 
                WHEN CardType = 'meal' THEN 'meal'
                WHEN CardType = 'gift' THEN 'gift'
                WHEN CardType = 'corporate' THEN 'corporate'
                ELSE 'unknown'
            END AS CardType,
            ProximityCardID,
            CustomerSpecialNotes
        FROM ${tenantId}.bonus_customerfiles WITH (NOLOCK)
        WHERE 1=1
        AND CustomerIsActive = 1
        AND CustomerKey = @CustomerKey
        `;

        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<any[]>({
            query,
            parameters: {
                CustomerKey: customerKey.toString()
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

        // Başarılı yanıt için müşteri bilgilerini customerInfo alanında döndürelim
        return res.status(200).json({
            success: true,
            message: 'Müşteri bilgileri başarıyla getirildi',
            customerInfo: result[0]
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
