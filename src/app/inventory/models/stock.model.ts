import { StockStatusEnum } from '../../core/models/stock-status.enum';
import { ProductModel } from './product.model';
export interface StockModel {
  id: string;
  description: string;
  date: any;
  transactionType: number;
  providerId: string;
  status: StockStatusEnum;
  providerName: string;
  providerRnc: string;
  storeId: string;
  storeName: string;
  reasonId: number;
  reasonName: string;
  stockDetails: StockDetailsModel[];
}

export interface StockDetailsModel {
  id: string;
  quantity: number;
  purchasePrice: number;
  productId: string;
  product: ProductModel;
}
