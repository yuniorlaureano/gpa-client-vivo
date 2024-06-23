import { ProductType } from '../../core/models/product-type.enum';
import { AddonModel } from './addon.model';

export interface ProductModel {
  id: string | null;
  code: string;
  name: string;
  photo: string | null;
  price: number;
  description: string;
  barCode: string;
  expirationDate: string | null;
  unitId: string;
  unit: string;
  categoryId: string;
  type: ProductType;
  category: string;
  productLocationId: string | null;
  productLocation: string;
  debit: number;
  credit: number;
  addons: AddonModel[];
}
