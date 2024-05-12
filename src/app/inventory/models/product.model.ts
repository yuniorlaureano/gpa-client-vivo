export interface ProductModel {
  id: string | null;
  code: string;
  name: string;
  photo: string | null;
  price: string;
  description: string;
  barCode: string;
  expirationDate: string | null;
  unitId: string;
  unit: string;
  categoryId: string;
  category: string;
  productLocationId: string | null;
  productLocation: string;
}
