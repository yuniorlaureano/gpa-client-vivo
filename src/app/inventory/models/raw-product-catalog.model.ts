import { ProductType } from '../../core/models/product-type.enum';
export interface RawProductCatalogModel {
  stock: number;
  input: number;
  output: number;
  productId: string;
  productName: string;
  productCode: string;
  categoryId: string;
  productType: ProductType;
  price: number;
}
