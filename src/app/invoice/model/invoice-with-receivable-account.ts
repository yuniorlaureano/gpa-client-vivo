import { InvoiceStatusEnum } from '../../core/models/invoice-status.enum';
import { PaymentStatusEnum } from '../../core/models/payment-status.enum';
import { SaleType } from '../../core/models/sale-type.enum';
import { ReceivableAccountModel } from './receivable-account.model';

export interface InvoiceWithReceivableAccountModel {
  invoiceId: string;
  invoiceStatus: InvoiceStatusEnum;
  saleType: SaleType;
  date: string;
  invoiceNote: string | null;
  invoiceCode: string | null;
  paymentStatus: PaymentStatusEnum;
  payment: number;
  clientId: string;
  clientName: string;
  clientIdentification: string;
  clientEmail: string;
  clientPhone: string;
  pendingPayment: ReceivableAccountModel | null;
  receivableAccounts: ReceivableAccountModel[];
}
