import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from './type';
import { v4 as uuidv4 } from 'uuid';
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

        const tenantId = extractTenantId(req.headers.referer);

        // Önce aynı isme veya kart numarasına sahip müşteri var mı kontrol et
        const checkResult = await instance.executeQuery({
            query: `
                DECLARE @IsExists BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';

                IF EXISTS (
                    SELECT 1 FROM [${tenantId}].bonus_customerfiles 
                    WHERE 
                        (CustomerName = @CustomerName)
                        OR (@CardNumber IS NOT NULL AND CardNumber = @CardNumber AND CardNumber <> '')
                )
                BEGIN
                    SET @IsExists = 1;
                    SET @Message = 'Bu isimde veya kart numarasına sahip müşteri zaten mevcut';
                END
                ELSE
                BEGIN
                    SET @IsExists = 0;
                    SET @Message = 'Müşteri oluşturulabilir';
                END

                SELECT @IsExists as IsExists, @Message as Message;
            `,
            parameters: {
                CustomerName: customerData.CustomerName,
                CardNumber: customerData.CardNumber || null
            },
            tenantId,
            req
        });

        if (checkResult?.[0]?.IsExists) {
            return res.status(400).json({
                success: false,
                message: checkResult[0].Message,
                error: 'DUPLICATE_CUSTOMER'
            });
        }

        // Müşteri yoksa yeni müşteri oluştur
        const customerKey = uuidv4();
        const customerGlobalKey = uuidv4();
        const editKey = uuidv4();
        const syncKey = uuidv4();
        const currentDate = new Date().toISOString();

        // Null olabilecek sayısal değerleri kontrol et
        const maritialStatus = customerData.MaritialStatus !== undefined ? customerData.MaritialStatus : null;
        const sexuality = customerData.Sexuality !== undefined ? customerData.Sexuality : null;
        const creditSatusID = customerData.CreditSatusID !== undefined ? customerData.CreditSatusID : null;

        // Boolean değerleri BIT olarak dönüştür (1 veya 0)
        const customerIsActive = customerData.CustomerIsActive !== undefined ? (customerData.CustomerIsActive ? 1 : 0) : 1;

        const result = await instance.executeQuery({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @InsertedID INT = 0;

                BEGIN TRY
                INSERT INTO [${tenantId}].bonus_customerfiles (
                        CustomerKey,
                        CustomerGlobalKey,
                        CustomerIsActive,
                        CustomerName,
                        CustomerFullName,
                        CardNumber,
                        PhoneNumber,
                        TaxOfficeName,
                        TaxNumber,
                        AddressNotes,
                        BirthDay,
                        Age,
                        MaritialStatus,
                        Sexuality,
                        EmailAddress,
                        FacebookAccount,
                        TwitterAccount,
                        WebSite,
                        CreditLimit,
                        CreditSatusID,
                        DiscountPercent,
                        SpecialBonusPercent,
                        BonusStartupValue,
                        CardType,
                        ProximityCardID,
                        CustomerSpecialNotes,
                        EditKey,
                        SyncKey,
                        AddDateTime,
                        EditDateTime,
                        TotalBonusRemaing
                    ) VALUES (
                        @CustomerKey,
                        @CustomerGlobalKey,
                        @CustomerIsActive, 
                        @CustomerName,
                        @CustomerFullName,
                        @CardNumber,
                        @PhoneNumber,
                        @TaxOfficeName,
                        @TaxNumber,
                        @AddressNotes,
                        @BirthDay,
                        @Age,
                        @MaritialStatus,
                        @Sexuality,
                        @EmailAddress,
                        @FacebookAccount,
                        @TwitterAccount,
                        @WebSite,
                        @CreditLimit,
                        @CreditSatusID,
                        @DiscountPercent,
                        @SpecialBonusPercent,
                        @BonusStartupValue,
                        @CardType,
                        @ProximityCardID,
                        @CustomerSpecialNotes,
                        @EditKey,
                        @SyncKey,
                        @CurrentDate,
                        @CurrentDate,
                        @BonusStartupValue
                    );

                    SET @InsertedID = SCOPE_IDENTITY();
                    
                    -- CustomerID'yi AutoID ile güncelle ve kart numarasını ayarla
                    UPDATE [${tenantId}].bonus_customerfiles
                    SET CustomerID = @InsertedID,
                        CardNumber = CASE 
                                        WHEN @CardNumber IS NULL OR @CardNumber = '' 
                                        THEN CONVERT(NVARCHAR(50), 1000000 + @InsertedID)
                                        ELSE @CardNumber 
                                     END
                    WHERE CustomerKey = @CustomerKey;
                    
                    SET @IsSuccess = 1;
                    SET @Message = 'Müşteri başarıyla oluşturuldu';
                END TRY
                BEGIN CATCH
                    SET @IsSuccess = 0;
                    SET @Message = ERROR_MESSAGE();
                END CATCH

                SELECT @InsertedID as AutoID, @IsSuccess as IsSuccess, @Message as Message;
            `,
            parameters: {
                CustomerKey: customerKey,
                CustomerGlobalKey: customerGlobalKey,
                CustomerIsActive: customerIsActive, // 1 veya 0 olarak gönder
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
                CurrentDate: currentDate,
                EditKey: editKey,
                SyncKey: syncKey,
            },
            tenantId,
            req
        });
        
        // executeQuery çağrısından sonra
        if (!result?.[0]?.IsSuccess) {
            return res.status(400).json({
                success: false,
                message: result?.[0]?.Message || 'Müşteri oluşturulurken bir hata oluştu',
                error: 'INSERT_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            message: result[0].Message,
            customerKey: customerKey,
            autoId: result[0].AutoID
        });

    } catch (error) {
        console.error('Error in customer creation:', error);
        return res.status(500).json({
            success: false,
            message: 'Müşteri oluşturulurken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
    }
}