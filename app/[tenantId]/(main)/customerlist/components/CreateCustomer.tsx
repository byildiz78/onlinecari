"use client"

import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams } from "next/navigation"
import { useCustomerForm } from "./hooks/useCustomerForm"
import { CustomerCardSection } from "./sections/CustomerCardSection"
import { AddressSection } from "./sections/AddressSection"
import { OtherInfoSection } from "./sections/OtherInfoSection"
import { CreditBalanceSection } from "./sections/CreditBalanceSection"
import { PointsSection } from "./sections/PointsSection"
import { CardInfoSection } from "./sections/CardInfoSection"
import { NotesSection } from "./sections/NotesSection"
import { CustomLoader } from "@/components/ui/custom-loader"
import { useCustomersStore } from "@/stores/main/customers-store"

interface CreateCustomerProps {
  customerKey?: string;
}

export default function CreateCustomer({ customerKey }: CreateCustomerProps) {
  const { customers } = useCustomersStore()
  
  const {
    customerData,
    setCustomerData,
    error,
    isSubmitting,
    isEditMode,
    isLoading,
    hasInitializedRef,
    fetchCustomerByKey,
    handleSubmit,
    setIsEditMode,
    setSelectedCustomer
  } = useCustomerForm(customerKey)

  // Düzenleme modu için müşteri verilerini yükle
  useEffect(() => {
    if (customerKey && !hasInitializedRef.current) {
      setIsEditMode(true)
      fetchCustomerByKey(customerKey)
      hasInitializedRef.current = true;
    } else if (!customerKey) {
      // Yeni müşteri oluşturma modu
      setIsEditMode(false)
      setSelectedCustomer(null)
    }

    // Component unmount olduğunda
    return () => {
      hasInitializedRef.current = false;
    }
  }, [customerKey, fetchCustomerByKey, setSelectedCustomer, setIsEditMode]) // CustomerKey ve fetchCustomerByKey değiştiğinde çalış

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <CustomLoader 
          message="Müşteri bilgileri yükleniyor" 
          description="Lütfen bekleyin, müşteri verileri hazırlanıyor..." 
        />
      ) : (
        <>
          <ScrollArea className="flex-1 px-4 overflow-y-auto">
            <div className="space-y-6 pb-24">
              {/* Form Bölümleri */}
              <CustomerCardSection customerData={customerData} setCustomerData={setCustomerData} />
              <AddressSection customerData={customerData} setCustomerData={setCustomerData} />
              <OtherInfoSection customerData={customerData} setCustomerData={setCustomerData} />
              <CreditBalanceSection customerData={customerData} setCustomerData={setCustomerData} />
              <PointsSection customerData={customerData} setCustomerData={setCustomerData} />
              <CardInfoSection customerData={customerData} setCustomerData={setCustomerData} />
              <NotesSection customerData={customerData} setCustomerData={setCustomerData} />
            </div>
          </ScrollArea>

          {/* Save Button */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t mt-auto">
            <div className="flex justify-end max-w-full mx-auto">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? "Güncelle" : "Kaydet"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
