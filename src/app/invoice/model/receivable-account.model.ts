export interface ReceivableAccountModel {
  id: string;
  pendingPayment: number;
  payment: number;
  date: string;
  invoiceId: string;
}
