export interface InventoryEntryModel {
  id: string;
  description: string | null;
  quantity: number;
  date: string;
  transactionType: number;
  productId: string;
  providerId: string | null;
  storeId: string | null;
  reasonId: string;
}
