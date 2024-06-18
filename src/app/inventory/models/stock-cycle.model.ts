import { CycleTypeEnum } from '../../core/models/cycle-type.enum';

export interface StockCycleModel {
  id: string | null;
  note: string | null;
  startDate: object | null;
  endDate: object | null;
  isClose: boolean;
  stockCycleDetails: StockCycleDetailModel[] | null;
}

export interface StockCycleDetailModel {
  id: string | null;
  productId: string;
  productName: string;
  productPrice: number;
  productType: number;
  stock: number;
  input: number;
  output: number;
  type: CycleTypeEnum;
  stockCycleId: string;
}
