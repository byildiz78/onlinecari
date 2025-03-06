import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the transaction update request interface
interface TransactionUpdateRequest {
    apiKey: string;
    // Required identifiers (at least one must be provided)
    customerKey?: string;
    cardNumber?: string; // CardNo in the table
    customerName?: string;
    
    // Transaction fields that can be updated
    paymentKey?: string;
    orderKey?: string;
    amountDue?: number;
    bonusUsed?: number;
    bonusEarned?: number;
    lineDeleted?: boolean;
    customField1?: string;
    customField2?: string;
    customField3?: string;
    customField4?: string;
    customField5?: string;
    branchID?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    const transactionData = req.body as TransactionUpdateRequest;

    // Check for required API key
    if (!transactionData.apiKey) {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir apiKey gereklidir',
            error: 'Body içerisinde geçerli bir apiKey gereklidir'
        });
    }

    // Check if transaction data is provided
    if (!transactionData) {
        return res.status(400).json({
            success: false,
            message: 'İşlem bilgileri gereklidir',
            error: 'İşlem bilgileri gereklidir'
        });
    }

    // OrderKey zorunlu olmalı
    if (!transactionData.orderKey || typeof transactionData.orderKey !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'OrderKey zorunludur ve geçerli bir GUID olmalıdır',
            error: 'ORDERKEY_REQUIRED'
        });
    }

    // Check if at least one customer identifier is provided
    const hasCustomerKey = transactionData.customerKey && typeof transactionData.customerKey === 'string';
    const hasCardNumber = transactionData.cardNumber && typeof transactionData.cardNumber === 'string';
    const hasCustomerName = transactionData.customerName && typeof transactionData.customerName === 'string';

    // Calculate the number of identifiers provided
    const identifierCount = [hasCustomerKey, hasCardNumber, hasCustomerName].filter(Boolean).length;

    // At least one identifier must be provided
    if (identifierCount === 0) {
        return res.status(400).json({
            success: false,
            message: 'Body içerisinde geçerli bir CustomerKey, CardNumber veya CustomerName değerlerinden en az biri gereklidir',
            error: 'Body içerisinde geçerli bir CustomerKey, CardNumber veya CustomerName değerlerinden en az biri gereklidir'
        });
    }

    let tenantId = ""; // Variable to store the tenant ID
    try {
        // Get the tenant ID based on the provided API key
        const tenantIdQuery = `Select tenantName from bonus_poscompanies Where companyKey = '${transactionData.apiKey}'`;
        const instance = Dataset.getInstance();
        const result = await instance.executeQuery<any>({
            query: tenantIdQuery,
            parameters: {
                ApiKey: transactionData.apiKey
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
        // Prepare parameters for the query
        const parameters: Record<string, any> = {
            CustomerKey: transactionData.customerKey,
            CardNo: transactionData.cardNumber || null,
            CustomerName: transactionData.customerName || null,
            PaymentKey: transactionData.paymentKey || null,
            OrderKey: transactionData.orderKey || null,
            AmountDue: transactionData.amountDue !== undefined ? transactionData.amountDue : null,
            BonusUsed: transactionData.bonusUsed !== undefined ? transactionData.bonusUsed : null,
            BonusEarned: transactionData.bonusEarned !== undefined ? transactionData.bonusEarned : null,
            LineDeleted: transactionData.lineDeleted !== undefined ? (transactionData.lineDeleted ? 1 : 0) : null,
            CustomField1: transactionData.customField1 || null,
            CustomField2: transactionData.customField2 || null,
            CustomField3: transactionData.customField3 || null,
            CustomField4: transactionData.customField4 || null,
            CustomField5: transactionData.customField5 || null,
            BranchID: transactionData.branchID || null,
            EditDateTime: new Date()
        };

        // Prepare WHERE conditions for transaction identification
        // OrderKey her zaman WHERE koşulunda olmalı
        let whereConditions = ["OrderKey = TRY_CONVERT(UNIQUEIDENTIFIER, @OrderKey)"];
        
        // Müşteri belirleme koşullarını ekle (AND ile)
        const customerConditions = [];
        if (hasCustomerKey) {
            customerConditions.push("CustomerKey = TRY_CONVERT(UNIQUEIDENTIFIER, @CustomerKey)");
        }
        if (hasCardNumber) {
            customerConditions.push("CardNo = @CardNo");
        }
        if (hasCustomerName) {
            customerConditions.push("CustomerName = @CustomerName");
        }
        
        // Eğer müşteri belirleme koşulları varsa, bunları ana WHERE koşuluna AND ile ekle
        if (customerConditions.length > 0) {
            whereConditions.push(`(${customerConditions.join(" OR ")})`);
        }

        // Combine the WHERE conditions with AND
        const whereClause = whereConditions.join(" AND ");

        // Execute the query to update the transaction and customer balance
        const instance = Dataset.getInstance();
        const result = await instance.executeQuery({
            query: `
                DECLARE @IsSuccess BIT = 0;
                DECLARE @Message NVARCHAR(200) = '';
                DECLARE @TransactionID INT = 0;
                DECLARE @TransactionExists BIT = 0;
                DECLARE @CustomerKey UNIQUEIDENTIFIER = NULL;
                
                -- Check if the transaction exists
                IF EXISTS (
                    SELECT 1 
                    FROM [${tenantId}].bonus_transactions WITH (NOLOCK)
                    WHERE ${whereClause}
                )
                BEGIN
                    SET @TransactionExists = 1;
                    
                    -- Get the CustomerKey for the customer balance updates
                    SELECT TOP 1 @CustomerKey = CustomerKey 
                    FROM [${tenantId}].bonus_transactions 
                    WHERE ${whereClause};
                    
                    BEGIN TRY
                        -- Update transaction details
                        UPDATE [${tenantId}].bonus_transactions
                        SET 
                            PaymentKey = CASE WHEN @PaymentKey IS NOT NULL THEN TRY_CONVERT(UNIQUEIDENTIFIER, @PaymentKey) ELSE PaymentKey END,
                            OrderKey = CASE WHEN @OrderKey IS NOT NULL THEN TRY_CONVERT(UNIQUEIDENTIFIER, @OrderKey) ELSE OrderKey END,
                            AmountDue = CASE WHEN @AmountDue IS NOT NULL THEN @AmountDue ELSE AmountDue END,
                            BonusUsed = CASE WHEN @BonusUsed IS NOT NULL THEN @BonusUsed ELSE BonusUsed END,
                            BonusEarned = CASE WHEN @BonusEarned IS NOT NULL THEN @BonusEarned ELSE BonusEarned END,
                            LineDeleted = CASE WHEN @LineDeleted IS NOT NULL THEN @LineDeleted ELSE LineDeleted END,
                            CustomField1 = CASE WHEN @CustomField1 IS NOT NULL THEN @CustomField1 ELSE CustomField1 END,
                            CustomField2 = CASE WHEN @CustomField2 IS NOT NULL THEN @CustomField2 ELSE CustomField2 END,
                            CustomField3 = CASE WHEN @CustomField3 IS NOT NULL THEN @CustomField3 ELSE CustomField3 END,
                            CustomField4 = CASE WHEN @CustomField4 IS NOT NULL THEN @CustomField4 ELSE CustomField4 END,
                            CustomField5 = CASE WHEN @CustomField5 IS NOT NULL THEN @CustomField5 ELSE CustomField5 END,
                            BranchID = CASE WHEN @BranchID IS NOT NULL THEN @BranchID ELSE BranchID END,
                            EditDateTime = @EditDateTime
                        WHERE ${whereClause};
                        
                        -- Update customer bonus totals
                        IF @CustomerKey IS NOT NULL
                        BEGIN
                            -- Müşteri bakiye bilgilerini güncelle
                            UPDATE [${tenantId}].bonus_customerfiles
                            SET 
                                TotalBonusUsed = ISNULL(TotalBonusUsed, 0) + @AmountDue,
                                TotalBonusRemaing = ISNULL(TotalBonusRemaing, 0) - @AmountDue,
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
                        END

                        SET @IsSuccess = 1;
                        SET @Message = 'İşlem başarıyla güncellendi';
                    END TRY
                    BEGIN CATCH
                        SET @IsSuccess = 0;
                        SET @Message = ERROR_MESSAGE();
                    END CATCH
                END
                ELSE
                BEGIN
                    -- Transaction not found
                    SET @TransactionExists = 0;
                    SET @Message = 'İşlem bulunamadı';
                    SET @IsSuccess = 0;
                END

                SELECT @TransactionID as TransactionID, @IsSuccess as IsSuccess, @Message as Message, @TransactionExists as TransactionExists, @CustomerKey as CustomerKey;
            `,
            parameters,
            tenantId,
            req
        });

        if (!result?.[0]?.TransactionExists) {
            return res.status(404).json({
                success: false,
                message: 'İşlem bulunamadı',
                error: 'TRANSACTION_NOT_FOUND'
            });
        }

        if (!result?.[0]?.IsSuccess) {
            return res.status(400).json({
                success: false,
                message: result?.[0]?.Message || 'İşlem güncellenirken bir hata oluştu',
                error: 'UPDATE_ERROR'
            });
        }

        return res.status(200).json({
            success: true,
            message: result[0].Message,
            customerKey: result[0].CustomerKey,
            transactionID: result[0].TransactionID
        });

    } catch (error) {
        console.error('Error in transaction update:', error);
        return res.status(500).json({
            success: false,
            message: 'İşlem güncellenirken bir hata oluştu',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
    }
}