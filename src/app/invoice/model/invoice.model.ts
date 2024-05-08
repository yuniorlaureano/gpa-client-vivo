import { SaleType } from '../../core/models/sale-type.enum';
import { RawProductCatalogModel } from '../../inventory/models/raw-product-catalog.model';
import { ClientModel } from './client.model';

export interface InvoiceModel {
  id: string | null;
  status: string;
  type: SaleType;
  expirationDate: object | null;
  date: object | null;
  note: string | null;
  clientId: string;
  invoiceDetails: InvoiceDetailModel[];
  client: ClientModel | null;
}

export interface InvoiceDetailModel {
  id: string | null;
  price: number;
  quantity: number;
  productId: string;
  stockProduct: RawProductCatalogModel | null;
}
