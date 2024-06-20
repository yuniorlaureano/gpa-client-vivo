import { ProductType } from '../models/product-type.enum';

export const getProductTypeDescription = (type: ProductType): string => {
  switch (type) {
    case ProductType.FinishedProduct:
      return 'Producto terminado';
    case ProductType.RawProduct:
      return 'Materia prima';
    default:
      return '';
  }
};
