"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ActionInputsProps {
  setActions: (actions: any) => void;
  actions: any;
}

const ActionInputs: React.FC<ActionInputsProps> = ({ setActions, actions }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setActions({...actions, [field]: e.target.value});
  };

  const handleSelectChange = (value: string, field: string) => {
    setActions({...actions, [field]: value});
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-white text-green-600 border-green-200 px-3 py-1">
            Ödül Tipi
          </Badge>
        </div>
        <Select 
          value={actions.rewardType || ''} 
          onValueChange={(value) => handleSelectChange(value, 'rewardType')}
        >
          <SelectTrigger className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500">
            <SelectValue placeholder="Ödül Tipi Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="discountPercentage">İndirim Yüzdesi</SelectItem>
            <SelectItem value="discountAmount">İndirim Tutarı</SelectItem>
            <SelectItem value="loyaltyPoints">Sadakat Puanı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {actions.rewardType === 'discountPercentage' && (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-green-100 dark:border-green-900 dark:bg-gray-800">
          <Label className="text-sm font-medium">İndirim Yüzdesi (%)</Label>
          <Input 
            type="number" 
            placeholder="Örn: 10" 
            value={actions.discountPercentage || ''} 
            onChange={(e) => handleInputChange(e, 'discountPercentage')} 
            className="border-gray-300 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu segmentteki müşteriler için uygulanacak indirim yüzdesini girin.
          </p>
        </div>
      )}

      {actions.rewardType === 'discountAmount' && (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-green-100 dark:border-green-900 dark:bg-gray-800">
          <Label className="text-sm font-medium">İndirim Tutarı (₺)</Label>
          <Input 
            type="number" 
            placeholder="Örn: 50" 
            value={actions.discountAmount || ''} 
            onChange={(e) => handleInputChange(e, 'discountAmount')} 
            className="border-gray-300 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu segmentteki müşteriler için uygulanacak sabit indirim tutarını girin.
          </p>
        </div>
      )}

      {actions.rewardType === 'loyaltyPoints' && (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-green-100 dark:border-green-900 dark:bg-gray-800">
          <Label className="text-sm font-medium">Sadakat Puanı</Label>
          <Input 
            type="number" 
            placeholder="Örn: 100" 
            value={actions.loyaltyPoints || ''} 
            onChange={(e) => handleInputChange(e, 'loyaltyPoints')} 
            className="border-gray-300 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bu segmentteki müşterilere eklenecek sadakat puanını girin.
          </p>
        </div>
      )}

      <div className="space-y-4 mt-6">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-white text-green-600 border-green-200 px-3 py-1">
            Geçerlilik Süresi
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Başlangıç Tarihi</Label>
            <Input 
              type="date" 
              value={actions.startDate || ''} 
              onChange={(e) => handleInputChange(e, 'startDate')} 
              className="border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bitiş Tarihi</Label>
            <Input 
              type="date" 
              value={actions.endDate || ''} 
              onChange={(e) => handleInputChange(e, 'endDate')} 
              className="border-gray-300 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionInputs;
