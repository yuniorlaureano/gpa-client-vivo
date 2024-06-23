export interface AddonModel {
  id: string | null;
  concept: string;
  isDiscount: boolean;
  type: AddonType;
  value: number;
}

export type AddonType = 'PERCENTAGE' | 'AMOUNT';

export const AddonTypeConst = {
  percentage: 'PERCENTAGE',
  amount: 'AMOUNT',
};
