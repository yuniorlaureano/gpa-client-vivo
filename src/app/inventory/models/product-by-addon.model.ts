export interface ProductByAddonModel {
  id: string;
  code: string;
  name: string;
  photo: string | null;
  price: number;
  description: string;
  isSelected: boolean;
}
