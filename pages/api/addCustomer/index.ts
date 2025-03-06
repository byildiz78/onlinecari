import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { CustomerRequest } from './customer';

// Null ve boş string kontrolü için yardımcı fonksiyon
const nullIfEmpty = (value: any): string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
        return value.trim() ? value.trim() : null;
    }
    return String(value); // Diğer türleri string'e dönüştür
};

// Müşteri verilerini doğrulayan yardımcı fonksiyon
function validateCustomerData(data: any): { 
    valid: boolean; 
    error?: string; 
    errorCode?: string;
} {
    if (!data) {
        return { valid: false, error: 'Müşteri bilgileri gereklidir', errorCode: 'MISSING_DATA' };
    }

    if (!data.apiKey) {
        return { valid: false, error: 'Body içerisinde geçerli bir apiKey gereklidir', errorCode: 'Body içerisinde geçerli bir apiKey gereklidir' };
    }
 
    if (!data.customerName) {
        return { valid: false, error: 'Müşteri adı zorunludur', errorCode: 'MISSING_NAME' };
    }

    return { valid: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const instance = Dataset.getInstance();
        const customerData = req.body as CustomerRequest;

        // Veri doğrulama
        const validation = validateCustomerData(customerData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                error: validation.errorCode
            });
        }


        let tenantId = ""; // Tenant ID'yi saklamak için değişken tanımlıyoruz
        try {
            const tenantIdQuery = `Select tenantName from bonus_poscompanies Where companyKey = '${customerData.apiKey}'`;
            const instance = Dataset.getInstance();
            const result = await instance.executeQuery<any>({
                query: tenantIdQuery,
                parameters: {
                    ApiKey: customerData.apiKey
                },
                tenantId: "donerciali",
                req,
            });
    
            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant bulunamadı',
                    error: 'TENANT_NOT_FOUND'
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
                } : 'Unknown error'
            });
        }

        // UUID'leri oluştur
        const customerKey = uuidv4();
        const customerGlobalKey = uuidv4();
        const editKey = uuidv4();
        const syncKey = uuidv4();
        const currentDate = new Date().toISOString();

        // Null olabilecek sayısal değerleri kontrol et
        const maritialStatus = customerData.maritialStatus !== undefined ? customerData.maritialStatus : null;
        const sexuality = customerData.sexuality !== undefined ? customerData.sexuality : null;
        const creditSatusID = customerData.creditSatusID !== undefined ? customerData.creditSatusID : null;

        // Boolean değerleri BIT olarak dönüştür (1 veya 0)
        const customerIsActive = customerData.customerIsActive !== undefined ? (customerData.customerIsActive ? 1 : 0) : 1;

        // Parametreleri hazırla
        const params = {
            customerKey: nullIfEmpty(customerData.customerKey) || customerKey,
            customerGlobalKey: nullIfEmpty(customerData.customerGlobalKey) || customerGlobalKey,
            customerIsActive: customerIsActive,
            customerName: nullIfEmpty(customerData.customerName) || customerData.customerName,
            customerFullName: nullIfEmpty(customerData.customerFullName) || customerData.customerName,
            cardNumber: nullIfEmpty(customerData.cardNumber),
            phoneNumber: nullIfEmpty(customerData.phoneNumber),
            taxOfficeName: nullIfEmpty(customerData.taxOfficeName),
            taxNumber: nullIfEmpty(customerData.taxNumber),
            addressNotes: nullIfEmpty(customerData.addressNotes),
            birthDay: nullIfEmpty(customerData.birthDay),
            age: nullIfEmpty(customerData.age),
            maritialStatus: maritialStatus || null,
            sexuality: sexuality || null,
            emailAddress: nullIfEmpty(customerData.emailAddress),
            facebookAccount: nullIfEmpty(customerData.facebookAccount),
            twitterAccount: nullIfEmpty(customerData.twitterAccount),
            webSite: nullIfEmpty(customerData.webSite),
            creditLimit: customerData.creditLimit || 0,
            creditSatusID: creditSatusID || null,
            discountPercent: customerData.discountPercent || 0,
            specialBonusPercent: customerData.specialBonusPercent || 0,
            bonusStartupValue: customerData.bonusStartupValue || 0,
            cardType: nullIfEmpty(customerData.cardType),
            proximityCardID: nullIfEmpty(customerData.proximityCardID),
            customerSpecialNotes: nullIfEmpty(customerData.customerSpecialNotes),
            currentDate: currentDate,
            editKey: editKey,
            syncKey: syncKey
        };

        // Tek bir SQL sorgusu kullanarak kontrol ve ekleme işlemini birleştir
        const result = await instance.executeQuery({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @InsertedID INT = 0;
                DECLARE @IsExists BIT = 0;
                DECLARE @ErrorDetails NVARCHAR(MAX) = '';

                BEGIN TRANSACTION;

                -- Önce kontrol et
                IF EXISTS (
                    SELECT 1 FROM [${tenantId}].bonus_customerfiles WITH (NOLOCK)
                    WHERE 
                        (CustomerName = @CustomerName)
                        OR (@CardNumber IS NOT NULL AND CardNumber = @CardNumber AND CardNumber <> '')
                )
                BEGIN
                    SET @IsExists = 1;
                    SET @Message = 'Bu isimde veya kart numarasına sahip müşteri zaten mevcut';
                    SET @IsSuccess = 0;
                END
                ELSE
                BEGIN
                    -- Müşteri yoksa ekle
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
                        SET @ErrorDetails = CONCAT(
                            'Error Number: ', ERROR_NUMBER(), 
                            ', Line: ', ERROR_LINE(),
                            ', Procedure: ', ERROR_PROCEDURE(),
                            ', Severity: ', ERROR_SEVERITY(),
                            ', State: ', ERROR_STATE()
                        );
                    END CATCH
                END

                IF @IsSuccess = 1
                    COMMIT TRANSACTION;
                ELSE
                    ROLLBACK TRANSACTION;

                SELECT @InsertedID as AutoID, @IsSuccess as IsSuccess, @Message as Message, @IsExists as IsExists, @ErrorDetails as ErrorDetails;
            `,
            parameters: params,
            tenantId,
            req
        });
        
        // Sonucu kontrol et
        if (result?.[0]?.IsExists) {
            return res.status(400).json({
                success: false,
                message: result[0].Message,
                error: 'DUPLICATE_CUSTOMER'
            });
        }

        if (!result?.[0]?.IsSuccess) {
            console.error('SQL Error details:', {
                operation: 'createCustomer',
                tenantId,
                message: result?.[0]?.Message,
                details: result?.[0]?.ErrorDetails
            });

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
        console.error('Error in customer creation:', {
            operation: 'createCustomer',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
        
        return res.status(500).json({
            success: false,
            message: 'Müşteri oluşturulurken bir hata oluştu',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}