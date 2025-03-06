import { Dataset } from '@/lib/dataset';
import { NextApiRequest, NextApiResponse } from 'next';
import { OrderRequest } from '../addCustomerOrders/order';

// Sipariş verilerini doğrulayan yardımcı fonksiyon
function validateOrderData(data: OrderRequest): { 
    valid: boolean; 
    error?: string; 
    errorCode?: string;
} {
    if (!data) {
        return { valid: false, error: 'Sipariş bilgileri gereklidir', errorCode: 'MISSING_DATA' };
    }

    if (!data.apiKey) {
        return { valid: false, error: 'Body içerisinde geçerli bir apiKey gereklidir', errorCode: 'MISSING_API_KEY' };
    }
    
    if (!data.orderHeader) {
        return { valid: false, error: 'Ana sipariş bilgileri gereklidir', errorCode: 'MISSING_ORDER_HEADER' };
    }

    if (!data.orderHeader.OrderKey || !data.orderHeader.OrderID) {
        return { valid: false, error: 'Sipariş anahtarı (OrderKey) ve ID (OrderID) gereklidir', errorCode: 'MISSING_ORDER_KEYS' };
    }
    
    if (!data.orderHeader.EditKey || !data.orderHeader.SyncKey) {
        return { valid: false, error: 'EditKey ve SyncKey değerleri gereklidir', errorCode: 'MISSING_HEADER_KEYS' };
    }
 
    if (!data.orderTransactions || !Array.isArray(data.orderTransactions) || data.orderTransactions.length === 0) {
        return { valid: false, error: 'En az bir sipariş kalemi gereklidir', errorCode: 'MISSING_ORDER_ITEMS' };
    }

    // Sipariş kalemlerinde gerekli alanları kontrol et
    for (const transaction of data.orderTransactions) {
        if (!transaction.TransactionKey || !transaction.TransactionID || !transaction.OrderKey || !transaction.OrderID || !transaction.EditKey || !transaction.SyncKey) {
            return { valid: false, error: 'Sipariş kalemlerinde gerekli anahtarlar eksik', errorCode: 'MISSING_TRANSACTION_KEYS' };
        }
    }

    if (!data.orderPayments || !Array.isArray(data.orderPayments) || data.orderPayments.length === 0) {
        return { valid: false, error: 'En az bir ödeme yöntemi gereklidir', errorCode: 'MISSING_PAYMENT_METHODS' };
    }
    
    // Ödeme kayıtlarında gerekli alanları kontrol et
    for (const payment of data.orderPayments) {
        if (!payment.PaymentKey || !payment.OrderPaymentID || !payment.OrderKey || !payment.OrderID || !payment.EditKey || !payment.SyncKey) {
            return { valid: false, error: 'Ödeme kayıtlarında gerekli anahtarlar eksik', errorCode: 'MISSING_PAYMENT_KEYS' };
        }
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
        const orderData = req.body as OrderRequest;

        // Veri doğrulama
        const validation = validateOrderData(orderData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                error: validation.errorCode
            });
        }

        // Tenant ID'yi bul
        let tenantId = "";
        try {
            const tenantIdQuery = `SELECT tenantName FROM bonus_poscompanies WHERE companyKey = @ApiKey`;
            const instance = Dataset.getInstance();
            const result = await instance.executeQuery<any>({
                query: tenantIdQuery,
                parameters: {
                    ApiKey: orderData.apiKey
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

        // Siparişi güncelle - Delete ve Insert işlemlerini tek transaction içinde yap
        const result = await updateOrderData(orderData, tenantId, req);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
                error: result.errorCode
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Sipariş başarıyla güncellendi',
            orderKey: orderData.orderHeader.OrderKey,
            orderId: orderData.orderHeader.OrderID
        });

    } catch (error) {
        console.error('Error in order update:', {
            operation: 'updateOrder',
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error'
        });
        
        return res.status(500).json({
            success: false,
            message: 'Sipariş güncellenirken bir hata oluştu',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Tüm sipariş verilerini güncelleyen fonksiyon (Delete-Insert yaklaşımı)
async function updateOrderData(
    orderData: OrderRequest, 
    tenantId: string, 
    req: NextApiRequest
): Promise<{ success: boolean; message: string; errorCode?: string }> {
    const instance = Dataset.getInstance();
    
    try {
        // Ana sipariş ve tüm alt kayıtları tek bir SQL transaction içinde gerçekleştir
        // 1. Ana sipariş için parametreleri hazırla
        const headerParams: Record<string, any> = {};
        for (const [key, value] of Object.entries(orderData.orderHeader)) {
            if (key !== 'AutoID') {
                headerParams[`Header_${key}`] = value === '' ? null : value;
            }
        }
        
        // 2. Transactions için parametreleri hazırla
        // Her bir transaction için ayrı bir parametre seti oluştur
        const transactionParams: Record<string, any> = {};
        orderData.orderTransactions.forEach((transaction, index) => {
            for (const [key, value] of Object.entries(transaction)) {
                if (key !== 'AutoID') {
                    transactionParams[`Trans${index}_${key}`] = value === '' ? null : value;
                }
            }
        });
        
        // 3. Payments için parametreleri hazırla
        // Her bir payment için ayrı bir parametre seti oluştur
        const paymentParams: Record<string, any> = {};
        orderData.orderPayments.forEach((payment, index) => {
            for (const [key, value] of Object.entries(payment)) {
                if (key !== 'AutoID') {
                    paymentParams[`Payment${index}_${key}`] = value === '' ? null : value;
                }
            }
        });
        
        // 4. Tüm parametreleri birleştir
        const allParams = {
            ...headerParams,
            ...transactionParams,
            ...paymentParams,
            TransactionCount: orderData.orderTransactions.length,
            PaymentCount: orderData.orderPayments.length
        };
        
        // 5. T-SQL prosedürü ile delete ve insert işlemlerini tek transaction içinde gerçekleştir
        const query = `
            DECLARE @IsSuccess BIT = 0;
            DECLARE @Message NVARCHAR(500) = '';
            DECLARE @ErrorDetails NVARCHAR(MAX) = '';
            DECLARE @OrderExists BIT = 0;
            
            -- OrderKey'in olup olmadığını kontrol et (kayıt yoksa güncelleme yapılamaz)
            IF NOT EXISTS (SELECT 1 FROM [${tenantId}].bonus_orderheaders WHERE OrderKey = @Header_OrderKey)
            BEGIN
                SET @OrderExists = 0;
                SET @Message = 'Bu OrderKey ile bir kayıt bulunamadı, güncelleme yapılamadı: ' + @Header_OrderKey;
                SET @IsSuccess = 0;
            END
            ELSE
            BEGIN
                BEGIN TRY
                    BEGIN TRANSACTION;
                    
                    -- 1. Önce ilgili kayıtları sil (ilişkili tabloların sırası önemli)
                    -- Önce alt tablolardan silme işlemi yap (foreign key constraint'lerden dolayı)
                    
                    -- Ödeme kayıtlarını sil
                    DELETE FROM [${tenantId}].bonus_orderpayments 
                    WHERE OrderKey = @Header_OrderKey;
                    
                    -- Sipariş kalemlerini sil
                    DELETE FROM [${tenantId}].bonus_ordertransactions 
                    WHERE OrderKey = @Header_OrderKey;
                    
                    -- Ana sipariş kaydını sil
                    DELETE FROM [${tenantId}].bonus_orderheaders 
                    WHERE OrderKey = @Header_OrderKey;
                    
                    -- 2. Şimdi yeni kayıtları ekle
                    
                    -- 2.1 Ana sipariş kaydını ekle
                    INSERT INTO [${tenantId}].bonus_orderheaders (
                        ${Object.keys(orderData.orderHeader)
                           .filter(key => key !== 'AutoID')
                           .join(', ')}
                    )
                    VALUES (
                        ${Object.keys(orderData.orderHeader)
                           .filter(key => key !== 'AutoID')
                           .map(key => `@Header_${key}`)
                           .join(', ')}
                    );
                    
                    -- 2.2 Sipariş kalemlerini ekle
                    ${orderData.orderTransactions.map((_, index) => `
                        INSERT INTO [${tenantId}].bonus_ordertransactions (
                            ${Object.keys(orderData.orderTransactions[index])
                               .filter(key => key !== 'AutoID')
                               .join(', ')}
                        )
                        VALUES (
                            ${Object.keys(orderData.orderTransactions[index])
                               .filter(key => key !== 'AutoID')
                               .map(key => `@Trans${index}_${key}`)
                               .join(', ')}
                        );
                    `).join('\n')}
                    
                    -- 2.3 Ödeme kayıtlarını ekle
                    ${orderData.orderPayments.map((_, index) => `
                        INSERT INTO [${tenantId}].bonus_orderpayments (
                            ${Object.keys(orderData.orderPayments[index])
                               .filter(key => key !== 'AutoID')
                               .join(', ')}
                        )
                        VALUES (
                            ${Object.keys(orderData.orderPayments[index])
                               .filter(key => key !== 'AutoID')
                               .map(key => `@Payment${index}_${key}`)
                               .join(', ')}
                        );
                    `).join('\n')}
                    
                    COMMIT TRANSACTION;
                    SET @IsSuccess = 1;
                    SET @Message = 'Sipariş başarıyla güncellendi';
                    SET @OrderExists = 1;
                END TRY
                BEGIN CATCH
                    ROLLBACK TRANSACTION;
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
            
            -- Sonucu döndür
            SELECT @IsSuccess AS IsSuccess, @Message AS Message, @OrderExists AS OrderExists, @ErrorDetails AS ErrorDetails;
        `;
        
        // Sorguyu çalıştır
        const result = await instance.executeQuery({
            query,
            parameters: allParams,
            tenantId,
            req
        });
        
        // Sonucu kontrol et
        if (!result || result.length === 0) {
            return {
                success: false,
                message: 'Sorgu sonucunda veri döndürülmedi',
                errorCode: 'QUERY_NO_RESULT'
            };
        }
        
        if (!result[0].OrderExists) {
            return {
                success: false,
                message: result[0].Message,
                errorCode: 'ORDER_NOT_FOUND'
            };
        }
        
        if (!result[0].IsSuccess) {
            console.error('SQL Error details:', {
                operation: 'updateOrderData',
                tenantId,
                message: result[0].Message,
                details: result[0].ErrorDetails
            });
            
            return {
                success: false,
                message: result[0].Message,
                errorCode: 'SQL_ERROR'
            };
        }
        
        return {
            success: true,
            message: result[0].Message
        };
        
    } catch (error) {
        console.error('Sipariş güncelleme hatası:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Bilinmeyen hata',
            errorCode: 'UPDATE_ORDER_ERROR'
        };
    }
}