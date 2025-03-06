import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from './type';
import { checkTenantDatabase, extractTenantId } from '@/lib/utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false,
            message: 'Method not allowed' 
        });
    }

    try {
        const { customerKey } = req.query;
        
        if (!customerKey || typeof customerKey !== 'string') {
            return res.status(400).json({ 
                success: false,
                message: 'CustomerKey parametresi gereklidir' 
            });
        }

        const tenantId = extractTenantId(req.headers.referer);
        const instance = Dataset.getInstance();
        
        const listQuery = `
                SELECT 
            CustomerKey,
            CustomerName,
            CustomerFullName,
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
            BonusStartupValue,
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
        FROM [${tenantId}].bonus_customerfiles WITH (NOLOCK)
        WHERE CustomerKey = @CustomerKey
        `;

        const result = await instance.executeQuery({
            query: listQuery,
            parameters: {
                CustomerKey: customerKey
            },
            tenantId,
            req
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Müşteri bulunamadı' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Müşteri bilgileri başarıyla getirildi',
            customer: result[0]
        });
    } catch (error: any) {
        console.error('Error in customer get handler:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu',
            error: error.message
        });
    }
}
