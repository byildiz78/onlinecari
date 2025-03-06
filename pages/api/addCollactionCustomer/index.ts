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

    if (!collectionData.customerKey || !collectionData.amount || !collectionData.apiKey) {
        return res.status(400).json({ 
            success: false,
            message: 'Müşteri, tutar ve API key bilgileri zorunludur' 
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
        console.log('customerKey',collectionData.customerKey)
        // Müşteri bilgilerini al
        const customerResult = await Dataset.getInstance().executeQuery<CustomerInfo[]>({
            query: `
                SELECT CustomerName, CardNumber
                FROM [${tenantId}].bonus_customerfiles 
                WHERE CustomerKey = @CustomerKey
            `,
            parameters: {
                CustomerKey: collectionData.customerKey
            },
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

        const customerName = customerResult[0].CustomerName;
        const cardNo = customerResult[0].CardNumber || '';

        // Tahsilat işlemini kaydet
        const result = await Dataset.getInstance().executeQuery<SqlResult[]>({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @InsertedID INT = 0;

                BEGIN TRY
                    -- Tahsilat işlemini kaydet
                    INSERT INTO [${tenantId}].bonus_transactions (
                        BranchID,
                        OrderDateTime,
                        PaymentKey,
                        OrderKey,
                        AmountDue,
                        BonusEarned,
                        BonusUsed,
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
                        @BonusEarned,
                        @BonusUsed,
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
                        TotalBonusUsed = ISNULL(TotalBonusUsed, 0) + @BonusUsed,
                        TotalBonusRemaing = ISNULL(TotalBonusRemaing, 0) - @BonusUsed,
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
                    SET @Message = 'Tahsilat işlemi başarıyla kaydedildi';
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
                CustomerKey: collectionData.customerKey,
                CustomerName: customerName,
                Description: collectionData.description || '',
                TransactionType: collectionData.transactionType || 'Infınıa Tahsilat - Alacak',
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
                message: result?.[0]?.Message || 'Tahsilat işlemi kaydedilirken bir hata oluştu',
                error: 'INSERT_ERROR'
            });
        }

        // Müşterinin güncel bonus bilgilerini al
        const updatedCustomerResult = await Dataset.getInstance().executeQuery({
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
                CustomerKey: collectionData.customerKey
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
        console.error('Tahsilat işlemi hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Tahsilat işlemi kaydedilirken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
    }
}
