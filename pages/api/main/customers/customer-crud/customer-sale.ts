import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
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
        const saleData = req.body;

        if (!saleData) {
            return res.status(400).json({
                success: false,
                message: 'Satış bilgileri gereklidir'
            });
        }

        // Zorunlu alanları kontrol et
        if (!saleData.customerKey || !saleData.amount) {
            return res.status(400).json({
                success: false,
                message: 'Müşteri ve tutar bilgileri zorunludur'
            });
        }

        const tenantId = extractTenantId(req.headers.referer);
        const bonusTransactionKey = uuidv4();
        const currentDate = new Date().toISOString();
        const orderDateTime = saleData.date ? new Date(saleData.date).toISOString() : currentDate;

        // Müşteri bilgilerini al
        const customerResult = await instance.executeQuery({
            query: `
                SELECT CustomerName, CardNumber, SpecialBonusPercent
                FROM [${tenantId}].bonus_customerfiles 
                WHERE CustomerKey = @CustomerKey
            `,
            parameters: {
                CustomerKey: saleData.customerKey
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
        const cardNo = customerResult[0].CardNumber;
        const specialBonusPercent = customerResult[0].SpecialBonusPercent || 0;
        
        // Kazanılan bonus puanı hesapla
        const bonusEarned = saleData.amount * (specialBonusPercent / 100);

        // Satış işlemini kaydet
        const result = await instance.executeQuery({
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
                BranchID: 0,
                PaymentKey: '00000000-0000-0000-0000-000000000000',
                OrderKey: '00000000-0000-0000-0000-000000000000',
                AmountDue: saleData.amount,
                BonusEarned: 0,
                BonusUsed: saleData.amount,
                LineDeleted: 0,
                CardNo: cardNo || '',
                CustomerKey: saleData.customerKey,
                CustomerName: customerName,
                Description: saleData.description || '',
                TransactionType: 'Robotpos - Borç',
                AddDateTime: currentDate,
                EditDateTime: currentDate,
                BonusTransactionKey: bonusTransactionKey
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

        return res.status(200).json({
            success: true,
            message: result[0].Message,
            transactionId: result[0].AutoID,
            bonusEarned: bonusEarned
        });

    } catch (error) {
        console.error('Error in sale transaction:', error);
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