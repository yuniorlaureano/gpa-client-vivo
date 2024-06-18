import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { SaleType } from '../../core/models/sale-type.enum';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { ClientModel } from './client.model';

export interface InvoiceModel {
  id: string | null;
  status: InvoiceStatusEnum;
  type: SaleType;
  date: object | null;
  note: string | null;
  payment: number;
  clientId: string;
  invoiceDetails: InvoiceDetailModel[];
  client: ClientModel | null;
}

export interface InvoiceDetailModel {
  id: string | null;
  price: number;
  quantity: number;
  productId: string;
  stockProduct: ProductCatalogModel | null;
}
