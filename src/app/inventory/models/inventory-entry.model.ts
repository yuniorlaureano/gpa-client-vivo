import { TransactionType } from '../../core/models/transaction-type.enum';

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

export interface InventoryEntryCollectionModel {
  id?: string | null;
  description?: string | null;
  date: string;
  transactionType: TransactionType;
  providerId: string | null;
  storeId: string | null;
  reasonId: string;
  products: { productId: string; quantity: number }[];
}
