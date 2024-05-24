import { ProductModel } from './product.model';
import { RawProductCatalogModel } from './raw-product-catalog.model';
export interface StockModel {
  id: string;
  description: string;
  date: any;
  transactionType: number;
  providerId: string;
  providerName: string;
  providerRnc: string;
  storeId: string;
  storeName: string;
  reasonId: string;
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
