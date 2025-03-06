import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { v4 as uuidv4 } from 'uuid';
import { CollectionRequest, CollectionResponse, CustomerInfo, SqlResult } from './collection';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CollectionResponse>
) {
    // Sadece POST isteklerini kabul ediyoruz
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    // Body'den tüm değerleri olduğu gibi alıyoruz
    const collectionData: CollectionRequest = req.body;

    // API key kontrolü
    if (!collectionData.apiKey || typeof collectionData.apiKey !== 'string' || !collectionData.amount || typeof collectionData.amount !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir apiKey, tutar değerleri gereklidir',
            error: 'Body içerisinde geçerli bir apiKey, tutar değerleri gereklidir'
        });
    }

    // En az bir tanımlayıcı (customerKey, customerName, cardNumber) olup olmadığını kontrol et
    const hasCustomerKey = collectionData.customerKey && typeof collectionData.customerKey === 'string';
    const hasCustomerName = collectionData.customerName && typeof collectionData.customerName === 'string';
    const hasCardNumber = collectionData.cardNumber && typeof collectionData.cardNumber === 'string';

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
        const tenantIdQuery = `Select tenantName from bonus_poscompanies Where companyKey = '${collectionData.apiKey}'`;
        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<any>({
            query: tenantIdQuery,
            parameters: {
                ApiKey: collectionData.apiKey
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
        // Müşteri bilgilerini al
        const instance = Dataset.getInstance();
        
        // WHERE koşullarını ve parametreleri hazırla
        const whereConditions = [];
        const parameters: Record<string, any> = {};
        
        if (hasCustomerKey) {
            whereConditions.push("CustomerKey = TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey)");
            parameters.CustomerKey = collectionData.customerKey;
        }
        
        if (hasCardNumber) {
            whereConditions.push("CardNumber = @CardNumber");
            parameters.CardNumber = collectionData.cardNumber;
        }
        
        if (hasCustomerName) {
            whereConditions.push("CustomerName = @CustomerName");
            parameters.CustomerName = collectionData.customerName;
        }
        
        // WHERE koşullarını birleştir
        const whereClause = whereConditions.join(" OR ");
        
        const customerResult = await instance.executeQuery<CustomerInfo[]>({
            query: `
                SELECT CustomerName, CardNumber, CustomerKey
                FROM [${tenantId}].bonus_customerfiles WITH (NOLOCK)
                WHERE ${whereClause}
            `,
            parameters,
            tenantId,
            req
        });

        if (!customerResult || customerResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Müşteri bulunamadı',
                error: 'CUSTOMER_NOT_FOUND'
            });
        }

        const customerName = customerResult[0].CustomerName || '';
        const cardNo = customerResult[0].CardNumber || '';
        const customerKey = customerResult[0].CustomerKey || '';

        // Satış işlemini kaydet
        const result = await instance.executeQuery<SqlResult[]>({
            query: `
                 DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @InsertedID INT = 0;

                BEGIN TRY
                    -- Satış işlemini kaydet
                    INSERT INTO [${tenantId}].bonus_transactions (
                        BranchID,
                        OrderDateTime,
                        PaymentKey,
                        OrderKey,
                        AmountDue,
                        BonusUsed,
                        BonusEarned,
                        LineDeleted,
                        CardNo,
                        CustomerKey,
                        CustomerName,
                        CustomField1,
                        CustomField2,
                        AddDateTime,
                        EditDateTime,
                        BonusTransactionKey
                    ) VALUES (
                        @BranchID,
                        GETDATE(),
                        @PaymentKey,
                        @OrderKey,
                        @AmountDue,
                        @BonusUsed,
                        @BonusEarned,
                        @LineDeleted,
                        @CardNo,
                        @CustomerKey,
                        @CustomerName,
                        @Description,
                        @TransactionType,
                        @AddDateTime,
                        @EditDateTime,
                        @BonusTransactionKey
                    );

                    SET @InsertedID = SCOPE_IDENTITY();
                    
                    -- Müşteri bakiye bilgilerini güncelle
                    UPDATE [${tenantId}].bonus_customerfiles
                    SET 
                        TotalBonusEarned = ISNULL(TotalBonusEarned, 0) + @BonusEarned,
                        TotalBonusRemaing = ISNULL(TotalBonusRemaing, 0) + @BonusEarned,
                        EditDateTime = @EditDateTime
                    WHERE CustomerKey = @CustomerKey;
                    
                    -- Bonus puanları yeniden hesapla
                    UPDATE [${tenantId}].bonus_customerfiles 
                    SET   
                        TotalBonusUsed = (
                            SELECT ISNULL(SUM(t.BonusUsed), 0) 
                            FROM [${tenantId}].bonus_transactions AS t WITH (NOLOCK) 
                            WHERE t.CustomerKey = bonus_customerfiles.CustomerKey 
                            AND ISNULL(t.LineDeleted, 0) = 0
                        ),  
                        TotalBonusEarned = (
                            SELECT ISNULL(SUM(t.BonusEarned), 0)  
                            FROM [${tenantId}].bonus_transactions AS t WITH (NOLOCK) 
                            WHERE t.CustomerKey = bonus_customerfiles.CustomerKey 
                            AND ISNULL(t.LineDeleted, 0) = 0
                        )
                    WHERE CustomerKey = @CustomerKey;

                    -- Kalan puanları güncelle
                    UPDATE [${tenantId}].bonus_customerfiles 
                    SET TotalBonusRemaing = ISNULL(BonusStartupValue, 0) + ISNULL(TotalBonusEarned, 0) - ISNULL(TotalBonusUsed, 0)
                    WHERE CustomerKey = @CustomerKey;

                    SET @IsSuccess = 1;
                    SET @Message = 'Satış işlemi başarıyla kaydedildi';
                END TRY
                BEGIN CATCH
                    SET @IsSuccess = 0;
                    SET @Message = ERROR_MESSAGE();
                END CATCH

                SELECT @InsertedID as AutoID, @IsSuccess as IsSuccess, @Message as Message;
            `,
            parameters: {
                BranchID: collectionData.branchID || 0,
                PaymentKey: collectionData.paymentKey || '00000000-0000-0000-0000-000000000000',
                OrderKey: collectionData.orderKey || '00000000-0000-0000-0000-000000000000',
                AmountDue: collectionData.amount,
                BonusEarned: collectionData.bonusEarned || 0,
                BonusUsed: collectionData.bonusUsed || collectionData.amount,
                LineDeleted: collectionData.lineDeleted || 0,
                CardNo: cardNo,
                CustomerKey: customerKey,
                CustomerName: customerName,
                Description: collectionData.description || '',
                TransactionType: collectionData.transactionType || 'Infınıa Satış - Borç',
                AddDateTime: collectionData.addDateTime || new Date().toISOString(),
                EditDateTime: collectionData.editDateTime || new Date().toISOString(),
                BonusTransactionKey: collectionData.bonusTransactionKey || uuidv4(),
            },
            tenantId,
            req
        });

        if (!result?.[0]?.IsSuccess) {
            return res.status(400).json({
                success: false,
                message: result?.[0]?.Message || 'Satış işlemi kaydedilirken bir hata oluştu',
                error: 'INSERT_ERROR'
            });
        }

        // Müşterinin güncel bonus bilgilerini al
        const updatedCustomerResult =await instance.executeQuery({
            query: `
                SELECT 
                    BonusStartupValue,
                    TotalBonusUsed,
                    TotalBonusEarned,
                    TotalBonusRemaing
                FROM [${tenantId}].bonus_customerfiles 
                WHERE CustomerKey = @CustomerKey
            `,
            parameters: {
                CustomerKey: customerKey
            },
            tenantId,
            req
        });

        return res.status(200).json({
            success: true,
            message: result[0].Message,
            transactionId: result[0].AutoID,
            bonusInfo: updatedCustomerResult[0]
        });

    } catch (error) {
        console.error('Satış işlemi hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Satış işlemi kaydedilirken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
    }
}
