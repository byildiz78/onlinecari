"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Mail, Facebook, Twitter, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function OtherInfoSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
              Diğer Bilgiler
            </h3>
            <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
              Ek müşteri bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label>Doğum Tarihi</Label>
            <Input
              type="date"
              value={customerData.birthDate}
              onChange={(e) => setCustomerData(prev => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Yaş</Label>
            <Input
              value={customerData.age}
              onChange={(e) => setCustomerData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="Yaş"
            />
          </div>
          <div>
            <Label>Medeni Hal</Label>
            <Select
              value={customerData.maritalStatus}
              onValueChange={(value) => setCustomerData(prev => ({ ...prev, maritalStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Bekar</SelectItem>
                <SelectItem value="married">Evli</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cinsiyet</Label>
            <Select
              value={customerData.gender}
              onValueChange={(value) => setCustomerData(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Erkek</SelectItem>
                <SelectItem value="female">Kadın</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div>
            <Label>E-Posta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="E-posta adresi"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Facebook</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={customerData.facebook}
                onChange={(e) => setCustomerData(prev => ({ ...prev, facebook: e.target.value }))}
                placeholder="Facebook profili"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Twitter</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={customerData.twitter}
                onChange={(e) => setCustomerData(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder="Twitter profili"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Web Sitesi</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={customerData.website}
                onChange={(e) => setCustomerData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Web sitesi adresi"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
