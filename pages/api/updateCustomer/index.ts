import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { CustomerRequest } from '../addCustomer/customer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    const instance = Dataset.getInstance();
    const customerData = req.body as CustomerRequest;

    if (!customerData.apiKey) {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir apiKey gereklidir',
            error: 'Body içerisinde geçerli bir apiKey gereklidir'
        });
    }

    if (!customerData) {
        return res.status(400).json({
            success: false,
            message: 'Müşteri bilgileri gereklidir',
            error: 'Müşteri bilgileri gereklidir'
        });
    }

    // En az bir tanımlayıcı (customerKey, customerName, cardNumber) olup olmadığını kontrol et
    const hasCustomerKey = customerData.customerKey && typeof customerData.customerKey === 'string';
    const hasCustomerName = customerData.customerName && typeof customerData.customerName === 'string';
    const hasCardNumber = customerData.cardNumber && typeof customerData.cardNumber === 'string';

    // Tanımlayıcı sayısını hesapla
    const identifierCount = [hasCustomerKey, hasCustomerName, hasCardNumber].filter(Boolean).length;

    // En az bir tanımlayıcı olmalı
    if (identifierCount === 0) {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir CustomerKey, CustomerName veya CardNumber değerlerinden en az biri gereklidir',
            error: 'Body içerisinde geçerli bir CustomerKey, CustomerName veya CardNumber değerlerinden en az biri gereklidir'
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

    try {
        // Null olabilecek sayısal değerleri kontrol et
        const maritialStatus = customerData.maritialStatus !== undefined ? customerData.maritialStatus : null;
        const sexuality = customerData.sexuality !== undefined ? customerData.sexuality : null;
        const creditSatusID = customerData.creditSatusID !== undefined ? customerData.creditSatusID : null;

        // Boolean değerleri BIT olarak dönüştür (1 veya 0)
        const customerIsActive = customerData.customerIsActive !== undefined ? (customerData.customerIsActive ? 1 : 0) : 1;


        // WHERE koşullarını ve parametreleri hazırla
        const whereConditions = [];
        const parameters: Record<string, any> = {
            CustomerKey: customerData.customerKey,
            CustomerIsActive: customerIsActive,
            CustomerName: customerData.customerName,
            CustomerFullName: customerData.customerFullName || customerData.customerName,
            CardNumber: customerData.cardNumber || null || "",
            PhoneNumber: customerData.phoneNumber || null || "",
            TaxOfficeName: customerData.taxOfficeName || null || "",
            TaxNumber: customerData.taxNumber || null || "",
            AddressNotes: customerData.addressNotes || null || "",
            BirthDay: customerData.birthDay || null || "",
            Age: customerData.age || null || "",
            MaritialStatus: maritialStatus || null || "",
            Sexuality: sexuality || null || "",
            EmailAddress: customerData.emailAddress || null || "",
            FacebookAccount: customerData.facebookAccount || null || "",
            TwitterAccount: customerData.twitterAccount || null || "",
            WebSite: customerData.webSite || null || "",
            CreditLimit: customerData.creditLimit || 0,
            CreditSatusID: creditSatusID || null || "",
            DiscountPercent: customerData.discountPercent || 0,
            SpecialBonusPercent: customerData.specialBonusPercent || 0,
            BonusStartupValue: customerData.bonusStartupValue || 0,
            CardType: customerData.cardType || null || "",
            ProximityCardID: customerData.proximityCardID || null || "",
            CustomerSpecialNotes: customerData.customerSpecialNotes || null || "",
        };

        if (hasCustomerKey) {
            whereConditions.push("CustomerKey = TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey)");
        }

        if (hasCardNumber) {
            whereConditions.push("CardNumber = @CardNumber");
        }

        if (hasCustomerName) {
            whereConditions.push("CustomerName = @CustomerName");
        }

        // WHERE koşullarını birleştir
        const whereClause = whereConditions.join(" OR ");

        // Müşteriyi güncelle ve aynı zamanda mükerrer kontrolü ve varlık kontrolü yap
        const result = await instance.executeQuery({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @CustomerID INT = 0;
                DECLARE @IsExists BIT = 0;
                DECLARE @CustomerExists BIT = 0;

                -- Önce müşterinin var olup olmadığını kontrol et
                IF EXISTS (
                    SELECT 1 
                    FROM [${tenantId}].bonus_customerfiles WITH (NOLOCK)
                    WHERE ${whereClause}
                )
                BEGIN
                    SET @CustomerExists = 1;
                    
                    -- Müşteri var, şimdi mükerrer kontrolü yap
                    IF EXISTS (
                        SELECT 1 FROM [${tenantId}].bonus_customerfiles 
                        WHERE 
                            (CustomerName = @CustomerName AND CustomerKey <> @CustomerKey)
                            OR (@CardNumber IS NOT NULL AND CardNumber = @CardNumber AND CardNumber <> '' AND CustomerKey <> @CustomerKey)
                    )
                    BEGIN
                        SET @IsExists = 1;
                        SET @Message = 'Bu isimde veya kart numarasına sahip başka bir müşteri zaten mevcut';
                        SET @IsSuccess = 0;
                    END
                    ELSE
                    BEGIN
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
                                EditDateTime = GETDATE()
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
                    END
                END
                ELSE
                BEGIN
                    -- Müşteri bulunamadı
                    SET @CustomerExists = 0;
                    SET @Message = 'Müşteri bulunamadı';
                    SET @IsSuccess = 0;
                END

                SELECT @CustomerID as CustomerID, @IsSuccess as IsSuccess, @Message as Message, @IsExists as IsExists, @CustomerExists as CustomerExists;
                `,
            parameters,
            tenantId,
            req
        });

        if (!result?.[0]?.CustomerExists) {
            return res.status(404).json({
                success: false,
                message: 'Müşteri bulunamadı',
                error: 'CUSTOMER_NOT_FOUND'
            });
        }

        if (result?.[0]?.IsExists) {
            return res.status(400).json({
                success: false,
                message: result[0].Message,
                error: 'DUPLICATE_CUSTOMER'
            });
        }

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
            customerKey: customerData.customerKey,
            customerID: result[0].customerID
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