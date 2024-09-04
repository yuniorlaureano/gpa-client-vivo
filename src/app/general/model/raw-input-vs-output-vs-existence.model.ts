import { ProductType } from '../../core/models/product-type.enum';

export interface RawInputVsOutputVsExistenceModel {
  input: number;
  output: number;
  existence: number;
  price: number;
  productId: string;
  productType: ProductType;
}
