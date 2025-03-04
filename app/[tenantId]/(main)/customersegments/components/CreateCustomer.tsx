"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Save, User, Phone, Mail, Building2, FileText, Calendar, Users, Globe, Facebook, Twitter, Link2, CreditCard, Wallet, BadgePercent, Target, UserCheck, UsersRound } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CreateCustomer() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerData, setCustomerData] = useState({
    // Segment Bilgileri
    name: "",
    code: "",
    description: "",
    isActive: true,

    // Segment Kriterleri
    criteria: {
      minSpendAmount: "",
      maxSpendAmount: "",
      minVisitCount: "",
      maxVisitCount: "",
      lastVisitDays: "",
      gender: "",
      minAge: "",
      maxAge: "",
      locationCodes: "",
      includeCategories: "",
      excludeCategories: ""
    },

    // Segment Kuralları
    rules: {
      discountPercentage: "",
      bonusPointPercentage: "",
      specialOffers: false,
      prioritySupport: false,
      birthdayGift: false
    },

    // Segment Notları
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // API call will be implemented here
      console.log("Segment oluşturuldu:", customerData)
      
    } catch (error) {
      console.error('Segment oluşturulurken hata:', error)
      setError(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-6 pb-24">
          {/* Segment Bilgileri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <UsersRound className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                    Müşteri Segmenti Bilgileri
                  </h3>
                  <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                    Temel segment tanımlamaları
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Segment Adı</Label>
                  <Input
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Müşteri segmenti adı"
                  />
                </div>
                <div>
                  <Label>Segment Kodu</Label>
                  <Input
                    value={customerData.code}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Kod (örn: VIP, ELITE)"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={customerData.description}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Segment açıklaması"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Segment Kriterleri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                    Segment Kriterleri
                  </h3>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    Müşterileri bu segmente dahil etme koşulları
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label>Min. Harcama Tutarı (₺)</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.minSpendAmount}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, minSpendAmount: e.target.value} 
                    }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Max. Harcama Tutarı (₺)</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.maxSpendAmount}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, maxSpendAmount: e.target.value} 
                    }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Min. Ziyaret Sayısı</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.minVisitCount}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, minVisitCount: e.target.value} 
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Max. Ziyaret Sayısı</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.maxVisitCount}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, maxVisitCount: e.target.value} 
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Son Ziyaret (Gün)</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.lastVisitDays}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, lastVisitDays: e.target.value} 
                    }))}
                    placeholder="Son kaç gün içinde"
                  />
                </div>
                <div>
                  <Label>Cinsiyet</Label>
                  <Select
                    value={customerData.criteria.gender}
                    onValueChange={(value) => setCustomerData(prev => ({
                      ...prev,
                      criteria: {...prev.criteria, gender: value}
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="male">Erkek</SelectItem>
                      <SelectItem value="female">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Min. Yaş</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.minAge}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, minAge: e.target.value} 
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Max. Yaş</Label>
                  <Input
                    type="number"
                    value={customerData.criteria.maxAge}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, maxAge: e.target.value} 
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Lokasyon Kodları</Label>
                  <Input
                    value={customerData.criteria.locationCodes}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, locationCodes: e.target.value} 
                    }))}
                    placeholder="Virgülle ayırın (İST, ANK, ...)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <Label>Dahil Kategori/Ürünler</Label>
                  <Textarea
                    value={customerData.criteria.includeCategories}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, includeCategories: e.target.value} 
                    }))}
                    placeholder="Dahil edilecek ürün/kategorileri yazın"
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Hariç Kategori/Ürünler</Label>
                  <Textarea
                    value={customerData.criteria.excludeCategories}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      criteria: {...prev.criteria, excludeCategories: e.target.value} 
                    }))}
                    placeholder="Hariç tutulacak ürün/kategorileri yazın"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Segment Kuralları ve Avantajlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <BadgePercent className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                    Segment Kuralları ve Avantajlar
                  </h3>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    Bu segmentteki müşterilere sağlanacak ayrıcalıklar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>İndirim Oranı (%)</Label>
                  <Input
                    type="number"
                    value={customerData.rules.discountPercentage}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      rules: {...prev.rules, discountPercentage: e.target.value} 
                    }))}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Bonus Puan Oranı (%)</Label>
                  <Input
                    type="number"
                    value={customerData.rules.bonusPointPercentage}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      rules: {...prev.rules, bonusPointPercentage: e.target.value} 
                    }))}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="specialOffers"
                    checked={customerData.rules.specialOffers}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      rules: {...prev.rules, specialOffers: e.target.checked} 
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <Label htmlFor="specialOffers">Özel Kampanyalara Dahil Et</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="prioritySupport"
                    checked={customerData.rules.prioritySupport}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      rules: {...prev.rules, prioritySupport: e.target.checked} 
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <Label htmlFor="prioritySupport">Öncelikli Müşteri Desteği</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="birthdayGift"
                    checked={customerData.rules.birthdayGift}
                    onChange={(e) => setCustomerData(prev => ({ 
                      ...prev, 
                      rules: {...prev.rules, birthdayGift: e.target.checked} 
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <Label htmlFor="birthdayGift">Doğum Günü Hediyesi</Label>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Segment Notları */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400">
                    Segment Notları
                  </h3>
                  <p className="text-sm text-violet-600/80 dark:text-violet-400/80">
                    Ek notlar ve açıklamalar
                  </p>
                </div>
              </div>

              <Textarea
                value={customerData.notes}
                onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Segment ile ilgili özel notlarınızı buraya girebilirsiniz..."
                className="min-h-[150px]"
              />
            </Card>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Save Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t mt-auto">
        <div className="flex justify-end max-w-full mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Kaydediliyor..." : "Segmenti Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  )
}
