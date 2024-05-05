import { SaleType } from '../../core/models/sale-type.enum';

export interface InvoiceModel {
  id: string | null;
  status: string;
  type: SaleType;
  expirationDate: object | null;
  date: object | null;
  note: string | null;
  clientId: string;
  invoiceDetails: InvoiceDetailModel;
}

export interface InvoiceDetailModel {
  id: string | null;
  price: number;
  quantity: number;
  productId: string;
}
