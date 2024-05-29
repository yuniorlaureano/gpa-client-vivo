import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { SaleType } from '../../core/models/sale-type.enum';
import { ReceivableAccountModel } from './receivable-account.model';

export interface InvoiceWithReceivableAccountModel {
  invoiceId: string;
  invoiceStatus: InvoiceStatusEnum;
  saleType: SaleType;
  date: string;
  invoiceNote: string | null;
  payment: number;
  clientName: string;
  clientIdentification: string;
  clientEmail: string;
  clientPhone: string;
  pendingPayment: ReceivableAccountModel | null;
  receivableAccounts: ReceivableAccountModel[];
}
