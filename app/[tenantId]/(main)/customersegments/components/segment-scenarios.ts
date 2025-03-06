// segment-scenarios.ts

export const segmentScenarios = {
  purchaseFrequency: {
    label: 'Alışveriş Sıklığı Bazlı Segmentler',
    details: [
      { value: 'noPurchaseSince', label: 'Belirli bir süredir alışveriş yapmayan müşteriler' },
      { value: 'frequentPurchase', label: 'Sık alışveriş yapan müşteriler' }
    ]
  },
  spendingAmount: {
    label: 'Harcama Tutarı Bazlı Segmentler',
    details: [
      { value: 'aboveAmount', label: 'Belirli bir tutarın üzerinde harcama yapan müşteriler' },
      { value: 'belowAmount', label: 'Belirli bir tutarın altında harcama yapan müşteriler' }
    ]
  }
};
