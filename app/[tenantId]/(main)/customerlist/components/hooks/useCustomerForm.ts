import { useState, useCallback, useRef } from "react"
import { Customer } from "@/pages/api/main/customers/customer-crud/type"
import { CustomerFormData } from "../types"
import { useCustomerStore } from "@/stores/main/customer-create-store"
import { useCustomersStore } from "@/stores/main/customers-store"
import { useTabStore } from "@/stores/tab-store"
import axios, { isAxiosError } from "@/lib/axios"
import { toast } from "@/components/ui/toast/use-toast"

export function useCustomerForm(customerKey?: string) {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { selectedCustomer, setSelectedCustomer, addCustomer, updateCustomer } = useCustomerStore()
  const { 
    addCustomer: addToCustomersList, 
    updateCustomer: updateInCustomersList,
    customers
  } = useCustomersStore()
  const { removeTab, setActiveTab } = useTabStore()
  const hasInitializedRef = useRef(false)

  const [customerData, setCustomerData] = useState<CustomerFormData>({
    // Müşteri Kartı
    name: "",
    fullName: "",
    phone: "",
    taxNumber: "",
    taxOffice: "",
    isActive: true,

    // Adres
    address: "",

    // Diğer Bilgiler
    birthDate: "",
    age: "",
    maritalStatus: "",
    gender: "",
    email: "",
    facebook: "",
    twitter: "",
    website: "",

    // Kredi ve Bakiye Bilgileri
    creditLimit: "",
    creditStatus: "",
    discount: "",
    totalPayment: "0",
    remainingDebt: "0",
    
    // Para Puan Bilgileri
    pointPercentage: "",
    pointStartDate: "",
    earned: "0",
    spent: "0",
    balance: "0",

    // Kart Bilgileri
    customerCard: "",
    cardType: "",
    proximityCardId: "",

    // Müşteri Özel Not
    notes: ""
  })

  const fillFormWithCustomerData = useCallback((customer: Customer) => {
    setCustomerData({
      name: customer.CustomerName || "",
      fullName: customer.CustomerFullName || "",
      phone: customer.PhoneNumber || "",
      taxNumber: customer.TaxNumber || "",
      taxOffice: customer.TaxOfficeName || "",
      isActive: true,
      address: customer.AddressNotes || "",
      birthDate: customer.BirthDay || "",
      age: customer.Age?.toString() || "",
      maritalStatus: customer.MaritialStatus?.toString() || "",
      gender: customer.Sexuality?.toString() || "",
      email: customer.EmailAddress || "",
      facebook: customer.FacebookAccount || "",
      twitter: customer.TwitterAccount || "",
      website: customer.WebSite || "",
      creditLimit: customer.CreditLimit?.toString() || "",
      creditStatus: customer.CreditSatusID?.toString() || "",
      discount: customer.DiscountPercent?.toString() || "",
      totalPayment: "0",
      remainingDebt: "0",
      pointPercentage: customer.SpecialBonusPercent?.toString() || "",
      pointStartDate: customer.BonusStartupValue?.toString() || "",
      earned: "0",
      spent: "0",
      balance: "0",
      customerCard: customer.CardNumber || "",
      cardType: customer.CardType || "",
      proximityCardId: customer.ProximityCardID || "",
      notes: customer.CustomerSpecialNotes || ""
    })
  }, [])

  const fetchCustomerByKey = useCallback(async (key: string) => {
    try {
      setIsLoading(true)
      setError("")
      
      // Önce store'dan müşteriyi ara
      const customerFromStore = customers.find(c => c.CustomerKey === key)
      
      if (customerFromStore) {
        // Store'da müşteri varsa, API çağrısı yapmadan kullan
        setSelectedCustomer(customerFromStore)
        fillFormWithCustomerData(customerFromStore)
      } else {
        // Store'da müşteri yoksa, API'den getir
        const response = await axios.get(`/api/main/customers/customer-crud/customer-get?customerKey=${key}`)

        if (response.data.success && response.data.customer) {
          setSelectedCustomer(response.data.customer)
          fillFormWithCustomerData(response.data.customer)
        } else {
          setError(response.data.message || 'Müşteri bulunamadı')
        }
      }
    } catch (error) {
      console.error('Müşteri getirme hatası:', error)
      if (isAxiosError(error)) {
        setError(error.response?.data?.message || error.message || 'Müşteri bilgileri alınamadı')
      } else {
        setError(error instanceof Error ? error.message : 'Müşteri bilgileri alınamadı')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fillFormWithCustomerData, setSelectedCustomer, customers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Form validasyonu
    if (!customerData.name.trim()) {
      setError("Müşteri adı zorunludur")
      setIsSubmitting(false)
      return
    }

    try {
      // Medeni hal değerini sayıya çevir
      let maritalStatusValue = null
      if (customerData.maritalStatus === "single") {
        maritalStatusValue = 0
      } else if (customerData.maritalStatus === "married") {
        maritalStatusValue = 1
      }

      // Cinsiyet değerini sayıya çevir
      let sexualityValue = null
      if (customerData.gender === "male") {
        sexualityValue = 0
      } else if (customerData.gender === "female") {
        sexualityValue = 1
      }

      // Kredi durumu değerini sayıya çevir
      let creditStatusValue = null
      if (customerData.creditStatus === "active") {
        creditStatusValue = 0
      } else if (customerData.creditStatus === "passive") {
        creditStatusValue = 1
      } else if (customerData.creditStatus === "blocked") {
        creditStatusValue = 2
      }

      // API'ye gönderilecek veriyi hazırla
      const customerPayload: Customer = {
        CustomerKey: selectedCustomer?.CustomerKey || "",
        CustomerName: customerData.name,
        CustomerFullName: customerData.fullName,
        PhoneNumber: customerData.phone,
        TaxNumber: customerData.taxNumber,
        TaxOfficeName: customerData.taxOffice,
        AddressNotes: customerData.address,
        BirthDay: customerData.birthDate || null,
        Age: customerData.age ? parseInt(customerData.age) : undefined,
        MaritialStatus: maritalStatusValue,
        Sexuality: sexualityValue,
        EmailAddress: customerData.email,
        FacebookAccount: customerData.facebook,
        TwitterAccount: customerData.twitter,
        WebSite: customerData.website,
        CreditLimit: customerData.creditLimit ? parseFloat(customerData.creditLimit) : undefined,
        CreditSatusID: creditStatusValue,
        DiscountPercent: customerData.discount ? parseFloat(customerData.discount) : undefined,
        SpecialBonusPercent: customerData.pointPercentage ? parseFloat(customerData.pointPercentage) : undefined,
        BonusStartupValue: customerData.pointStartDate ? parseFloat(customerData.pointStartDate) : undefined,
        CardNumber: customerData.customerCard,
        CardType: customerData.cardType,
        ProximityCardID: customerData.proximityCardId,
        CustomerSpecialNotes: customerData.notes,
        CustomerIsActive: true // SQL'de BIT olarak 1 değerine dönüşecek
      }

      // API isteği
      let response;
      if (isEditMode && selectedCustomer?.CustomerKey) {
        // Güncelleme API'si
        response = await axios.post('/api/main/customers/customer-crud/customer-update', customerPayload)
      } else {
        // Yeni oluşturma API'si
        response = await axios.post('/api/main/customers/customer-crud/customer-create', customerPayload)
      }

      const data = response.data

      if (data.success) {
        // Başarılı işlem
        const updatedCustomer = {
          ...customerPayload,
          CustomerKey: selectedCustomer?.CustomerKey || data.customerKey,
          CustomerID: data.customerID || data.autoId,
          // Kart numarası boşsa otomatik oluştur
          CardNumber: customerData.customerCard || `${1000000 + (data.customerID || data.autoId)}`,
          // Bakiye bilgilerini koru veya varsayılan değerler ata
          TotalBonusRemaing: selectedCustomer?.TotalBonusRemaing || 0,
          TotalBonusEarned: selectedCustomer?.TotalBonusEarned || 0,
          TotalBonusUsed: selectedCustomer?.TotalBonusUsed || 0,
          TotalDebt: selectedCustomer?.TotalDebt || 0,
          TotalPayment: selectedCustomer?.TotalPayment || 0,
          TotalRemainig: selectedCustomer?.TotalRemainig || 0
        };

        if (isEditMode) {
          // Güncelleme işlemi
          updateCustomer(updatedCustomer);
          // Müşteri listesini de güncelle
          updateInCustomersList(updatedCustomer);
          toast({
            title: "Başarılı",
            description: "Müşteri bilgileri güncellendi",
            variant: "default",
          })
        } else {
          // Yeni müşteri ekleme
          addCustomer(updatedCustomer);
          // Müşteri listesine de ekle
          addToCustomersList(updatedCustomer);
          toast({
            title: "Başarılı",
            description: "Yeni müşteri oluşturuldu",
            variant: "default",
          })
        }
        
        const tabId = customerKey ? `edit-customer-${customerKey}` : 'Yeni Müşteri'
        removeTab(tabId)
        setActiveTab('Müşteri Listesi')
      } else {
        // Hata durumu
        setError(data.message || 'İşlem sırasında bir hata oluştu')
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error)
      if (isAxiosError(error)) {
        setError(error.response?.data?.message || error.message || 'İşlem sırasında bir hata oluştu')
      } else {
        setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
