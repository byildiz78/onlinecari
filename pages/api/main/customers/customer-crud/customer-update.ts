import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from './type';
import { extractTenantId } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const instance = Dataset.getInstance();
        const customerData = req.body as Customer;

        if (!customerData) {
            return res.status(400).json({
                success: false,
                message: 'Müşteri bilgileri gereklidir'
            });
        }

        // Zorunlu alanları kontrol et
        if (!customerData.CustomerName) {
            return res.status(400).json({
                success: false,
                message: 'Müşteri adı zorunludur'
            });
        }

        // CustomerKey kontrolü
        if (!customerData.CustomerKey) {
            return res.status(400).json({
                success: false,
                message: 'Müşteri anahtarı (CustomerKey) zorunludur'
            });
        }

        const tenantId = extractTenantId(req.headers.referer);

        // Önce müşterinin var olup olmadığını kontrol et
        const checkCustomerExists = await instance.executeQuery({
            query: `
                SELECT 1 FROM [${tenantId}].bonus_customerfiles 
                WHERE CustomerKey = @CustomerKey
            `,
            parameters: {
                CustomerKey: customerData.CustomerKey
            },
            tenantId,
            req
        });

        if (!checkCustomerExists || checkCustomerExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Güncellenecek müşteri bulunamadı',
                error: 'CUSTOMER_NOT_FOUND'
            });
        }

        // Aynı isme veya kart numarasına sahip başka müşteri var mı kontrol et (kendisi hariç)
        const checkDuplicate = await instance.executeQuery({
            query: `
                DECLARE @IsExists BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';

                IF EXISTS (
                    SELECT 1 FROM [${tenantId}].bonus_customerfiles 
                    WHERE 
                        (CustomerName = @CustomerName AND CustomerKey <> @CustomerKey)
                        OR (@CardNumber IS NOT NULL AND CardNumber = @CardNumber AND CardNumber <> '' AND CustomerKey <> @CustomerKey)
                )
                BEGIN
                    SET @IsExists = 1;
                    SET @Message = 'Bu isimde veya kart numarasına sahip başka bir müşteri zaten mevcut';
                END
                ELSE
                BEGIN
                    SET @IsExists = 0;
                    SET @Message = 'Müşteri güncellenebilir';
                END

                SELECT @IsExists as IsExists, @Message as Message;
            `,
            parameters: {
                CustomerKey: customerData.CustomerKey,
                CustomerName: customerData.CustomerName,
                CardNumber: customerData.CardNumber || null
            },
            tenantId,
            req
        });

        if (checkDuplicate?.[0]?.IsExists) {
            return res.status(400).json({
                success: false,
                message: checkDuplicate[0].Message,
                error: 'DUPLICATE_CUSTOMER'
            });
        }

        // Null olabilecek sayısal değerleri kontrol et
        const maritialStatus = customerData.MaritialStatus !== undefined ? customerData.MaritialStatus : null;
        const sexuality = customerData.Sexuality !== undefined ? customerData.Sexuality : null;
        const creditSatusID = customerData.CreditSatusID !== undefined ? customerData.CreditSatusID : null;

        // Boolean değerleri BIT olarak dönüştür (1 veya 0)
        const customerIsActive = customerData.CustomerIsActive !== undefined ? (customerData.CustomerIsActive ? 1 : 0) : 1;

        const currentDate = new Date().toISOString();

        // Müşteriyi güncelle
        const result = await instance.executeQuery({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @CustomerID INT = 0;

                BEGIN TRY
                    -- Önce müşteri ID'sini al
                    SELECT @CustomerID = CustomerID 
                    FROM [${tenantId}].bonus_customerfiles 
                    WHERE CustomerKey = @CustomerKey;

                    -- Müşteriyi güncelle
                    UPDATE [${tenantId}].bonus_customerfiles
                    SET 
                        CustomerIsActive = @CustomerIsActive,
                        CustomerName = @CustomerName,
                        CustomerFullName = @CustomerFullName,
                        CardNumber = @CardNumber,
                        PhoneNumber = @PhoneNumber,
                        TaxOfficeName = @TaxOfficeName,
                        TaxNumber = @TaxNumber,
                        AddressNotes = @AddressNotes,
                        BirthDay = @BirthDay,
                        Age = @Age,
                        MaritialStatus = @MaritialStatus,
                        Sexuality = @Sexuality,
                        EmailAddress = @EmailAddress,
                        FacebookAccount = @FacebookAccount,
                        TwitterAccount = @TwitterAccount,
                        WebSite = @WebSite,
                        CreditLimit = @CreditLimit,
                        CreditSatusID = @CreditSatusID,
                        DiscountPercent = @DiscountPercent,
                        SpecialBonusPercent = @SpecialBonusPercent,
                        BonusStartupValue = @BonusStartupValue,
                        CardType = @CardType,
                        ProximityCardID = @ProximityCardID,
                        CustomerSpecialNotes = @CustomerSpecialNotes,
                        EditDateTime = @CurrentDate
                    WHERE CustomerKey = @CustomerKey;
                    

                    -- Kalan puanları güncelle
                    UPDATE [${tenantId}].bonus_customerfiles 
                    SET TotalBonusRemaing = ISNULL(BonusStartupValue, 0) + ISNULL(TotalBonusEarned, 0) - ISNULL(TotalBonusUsed, 0)
                    WHERE CustomerKey = @CustomerKey;

                    SET @IsSuccess = 1;
                    SET @Message = 'Müşteri başarıyla güncellendi';
                END TRY
                BEGIN CATCH
                    SET @IsSuccess = 0;
                    SET @Message = ERROR_MESSAGE();
                END CATCH

                SELECT @CustomerID as CustomerID, @IsSuccess as IsSuccess, @Message as Message;
            `,
            parameters: {
                CustomerKey: customerData.CustomerKey,
                CustomerIsActive: customerIsActive,
                CustomerName: customerData.CustomerName,
                CustomerFullName: customerData.CustomerFullName || customerData.CustomerName,
                CardNumber: customerData.CardNumber || null || "",
                PhoneNumber: customerData.PhoneNumber || null || "",
                TaxOfficeName: customerData.TaxOfficeName || null || "",
                TaxNumber: customerData.TaxNumber || null || "",
                AddressNotes: customerData.AddressNotes || null || "",
                BirthDay: customerData.BirthDay || null || "",
                Age: customerData.Age || null || "",
                MaritialStatus: maritialStatus || null || "",
                Sexuality: sexuality || null || "",
                EmailAddress: customerData.EmailAddress || null || "",
                FacebookAccount: customerData.FacebookAccount || null || "",
                TwitterAccount: customerData.TwitterAccount || null || "",
                WebSite: customerData.WebSite || null || "",
                CreditLimit: customerData.CreditLimit || 0,
                CreditSatusID: creditSatusID || null || "",
                DiscountPercent: customerData.DiscountPercent || 0,
                SpecialBonusPercent: customerData.SpecialBonusPercent || 0,
                BonusStartupValue: customerData.BonusStartupValue || 0,
                CardType: customerData.CardType || null || "",
                ProximityCardID: customerData.ProximityCardID || null || "",
                CustomerSpecialNotes: customerData.CustomerSpecialNotes || null || "",
                CurrentDate: currentDate
            },
            tenantId,
            req
        });

        if (!result?.[0]?.IsSuccess) {
            return res.status(400).json({
                success: false,
                message: result?.[0]?.Message || 'Müşteri güncellenirken bir hata oluştu',
                error: 'UPDATE_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            message: result[0].Message,
            customerKey: customerData.CustomerKey,
            customerID: result[0].CustomerID
        });

    } catch (error) {
        console.error('Error in customer update:', error);
        return res.status(500).json({
            success: false,
            message: 'Müşteri güncellenirken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
    }
}