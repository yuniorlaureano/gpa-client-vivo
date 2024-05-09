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
  productId: string;
  productCode: string;
  productName: string;
  productPrice: number;
  productCategoryId: string;
  stockProduct: RawProductCatalogModel | null;
}

export function fromStockDetailsModelToRawProductCatalogModel(
  stockDetail: StockDetailsModel
) {
  return <RawProductCatalogModel>{
    quantity: stockDetail.quantity,
    productId: stockDetail.productId,
    productName: stockDetail.productName,
    productCode: stockDetail.productCode,
    categoryId: stockDetail.productName,
    price: stockDetail.productPrice,
  };
}
