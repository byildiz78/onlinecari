import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from './type';
import { Dataset } from '@/lib/dataset';
import { extractTenantId } from '@/lib/utils';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const tenantId = extractTenantId(req.headers.referer);
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
        FROM [${tenantId}].bonus_customerfiles WITH (NOLOCK)
        WHERE CustomerIsActive = 1
        `;
        const instance = Dataset.getInstance();

        const result = await instance.executeQuery<Customer[]>({
            query,
            req
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in users handler:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
