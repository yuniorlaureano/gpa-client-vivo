import { ProductType } from '../../core/models/product-type.enum';
import { AddonModel } from './addon.model';
export interface ProductCatalogModel {
  stock: number;
  input: number;
  output: number;
  productId: string;
  productName: string;
  productCode: string;
  categoryId: string;
  productType: ProductType;
  debit: number;
  credit: number;
  price: number;
  addons: AddonModel[];
}
