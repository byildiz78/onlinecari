"use client";

import React, { useState, useCallback, useRef } from 'react';
import _ from 'lodash';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash, Calendar, DollarSign, ShoppingCart, Users, Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { segmentScenarios } from './segment-scenarios';

interface CriteriaInputsProps {
  selectedScenario: string | null;
  detailedScenario: string | null;
  setCriteria: (criteria: any) => void;
  criteria: any;
}

interface AdditionalCondition {
  scenarioType: string;
  detailedScenario: string | null;
  criteria: any;
}

interface ScenarioInputProps {
  scenarioType: string | null;
  detailedScenarioValue: string | null;
  criteriaData: any;
  isAdditional?: boolean;
  index?: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const NoPurchaseSinceInput: React.FC<{ criteriaData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }> = ({ criteriaData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-medium">Belirli Bir Süredir Alışveriş Yapmayan Müşteriler</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Son Alışveriş Tarihi</Label>
              <Input
                type="date"
                value={criteriaData.lastPurchaseDate || ''}
                onChange={(e) => handleChange(e, 'lastPurchaseDate')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belirtilen tarihten sonra alışveriş yapmayan müşterileri segmente dahil eder.
          </p>
        </div>
      </div>
    </div>
  );
};

const FrequentPurchaseInput: React.FC<{ criteriaData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }> = ({ criteriaData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-medium">Sık Alışveriş Yapan Müşteriler</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Minimum Alışveriş Sayısı</Label>
              <Input
                type="number"
                placeholder="Örn: 5"
                value={criteriaData.minPurchaseCount || ''}
                onChange={(e) => handleChange(e, 'minPurchaseCount')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zaman Aralığı (Gün)</Label>
              <Input
                type="number"
                placeholder="Örn: 30"
                value={criteriaData.timeFrame || ''}
                onChange={(e) => handleChange(e, 'timeFrame')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belirtilen zaman aralığında minimum alışveriş sayısına ulaşan müşterileri segmente dahil eder.
          </p>
        </div>
      </div>
    </div>
  );
};

const BelowAmountInput: React.FC<{ criteriaData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }> = ({ criteriaData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-medium">Belirli Bir Tutarın Altında Harcama Yapan Müşteriler</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Maksimum Tutar (₺)</Label>
              <Input
                type="number"
                placeholder="Örn: 1000"
                value={criteriaData.maxAmount || ''}
                onChange={(e) => handleChange(e, 'maxAmount')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zaman Aralığı (Gün)</Label>
              <Input
                type="number"
                placeholder="Örn: 90"
                value={criteriaData.timeFrame || ''}
                onChange={(e) => handleChange(e, 'timeFrame')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belirtilen zaman aralığında maksimum tutarın altında harcama yapan müşterileri segmente dahil eder.
          </p>
        </div>
      </div>
    </div>
  );
};

const AboveAmountInput: React.FC<{ criteriaData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void }> = ({ criteriaData, handleChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-medium">Belirli Bir Tutarın Üzerinde Harcama Yapan Müşteriler</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Minimum Tutar (₺)</Label>
              <Input
                type="number"
                placeholder="Örn: 5000"
                value={criteriaData.minAmount || ''}
                onChange={(e) => handleChange(e, 'minAmount')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zaman Aralığı (Gün)</Label>
              <Input
                type="number"
                placeholder="Örn: 90"
                value={criteriaData.timeFrame || ''}
                onChange={(e) => handleChange(e, 'timeFrame')}
                className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belirtilen zaman aralığında minimum tutarın üzerinde harcama yapan müşterileri segmente dahil eder.
          </p>
        </div>
      </div>
    </div>
  );
};

const ScenarioInput: React.FC<ScenarioInputProps> = ({
  scenarioType,
  detailedScenarioValue,
  criteriaData,
  isAdditional = false,
  index = -1,
  handleChange
}) => {
  if (!scenarioType || !detailedScenarioValue) return null;

  switch (scenarioType) {
    case 'purchaseFrequency':
      switch (detailedScenarioValue) {
        case 'noPurchaseSince':
          return <NoPurchaseSinceInput criteriaData={criteriaData} handleChange={handleChange} />;
        case 'frequentPurchase':
          return <FrequentPurchaseInput criteriaData={criteriaData} handleChange={handleChange} />;
        default:
          return null;
      }
    case 'purchaseAmount':
      switch (detailedScenarioValue) {
        case 'belowAmount':
          return <BelowAmountInput criteriaData={criteriaData} handleChange={handleChange} />;
        case 'aboveAmount':
          return <AboveAmountInput criteriaData={criteriaData} handleChange={handleChange} />;
        default:
          return null;
      }
    default:
      return null;
  }
};

const CriteriaInputs: React.FC<CriteriaInputsProps> = ({
  selectedScenario,
  detailedScenario,
  setCriteria,
  criteria
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    setCriteria({ ...criteria, [field]: value });
  }, [criteria, setCriteria]);

  return (
    <div className="space-y-6">
      <ScenarioInput
        scenarioType={selectedScenario}
        detailedScenarioValue={detailedScenario}
        criteriaData={criteria}
        handleChange={handleChange}
      />
    </div>
  );
};

export default CriteriaInputs;
