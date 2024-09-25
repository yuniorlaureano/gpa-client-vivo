import { StockStatusEnum } from '../../core/models/stock-status.enum';
import { ProductModel } from './product.model';
export interface StockModel {
  id: string;
  description: string;
  date: string;
  transactionType: number;
  providerId: string;
  status: StockStatusEnum;
  providerName: string;
  providerIdentification: string;
  storeId: string;
  storeName: string;
  reasonId: number;
  reasonName: string;
  invoiceId: string;
  stockDetails: StockDetailsModel[];
  createdByName: string;
  updatedByName: string;
}

export interface StockDetailsModel {
  id: string;
  quantity: number;
  purchasePrice: number;
  productId: string;
  product: ProductModel;
}
