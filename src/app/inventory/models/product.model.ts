import { ProductType } from '../../core/models/product-type.enum';
import { AddonModel } from './addon.model';
import { RawRelatedProductReadModel } from './raw-related-product-read.model';
import { RelatedProductModel } from './related-product.models';

export interface ProductModel {
  id: string | null;
  code: string;
  name: string;
  photo: string | null;
  price: number;
  description: string;
  unitValue: number;
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
  relatedProducts: RelatedProductModel[];
}

export interface ProductReadModel {
  id: string | null;
  code: string;
  name: string;
  photo: string | null;
  price: number;
  description: string;
  unitValue: number;
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
  relatedProducts: RawRelatedProductReadModel[];
}
