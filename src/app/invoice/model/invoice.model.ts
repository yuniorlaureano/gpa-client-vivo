import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { PaymentMethodEnum } from '../../core/models/payment-method.enum';
import { PaymentStatusEnum } from '../../core/models/payment-status.enum';
import { SaleType } from '../../core/models/sale-type.enum';
import { ProductCatalogModel } from '../../inventory/models/product-catalog.model';
import { ClientModel } from './client.model';

export interface InvoiceModel {
  id: string | null;
  status: InvoiceStatusEnum;
  type: SaleType;
  code: string;
  date: string;
  note: string | null;
  payment: number;
  paymentStatus: PaymentStatusEnum;
  clientId: string;
  createdByName: string;
  updatedByName: string;
  invoiceDetails: InvoiceDetailModel[];
  client: ClientModel | null;
  paymentMethod: PaymentMethodEnum;
}

export interface InvoiceDetailModel {
  id: string | null;
  price: number;
  quantity: number;
  productId: string;
  stockProduct: ProductCatalogModel | null;
}
