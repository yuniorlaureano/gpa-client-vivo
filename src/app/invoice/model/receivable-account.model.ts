export interface ReceivableAccountModel {
  id: string;
  pendingPayment: number;
  payment: number;
  date: object;
  invoiceId: string;
}
