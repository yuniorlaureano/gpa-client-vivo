export interface ClientDebitModel {
  id: string | null;
  pendingPayment: number;
  payment: number;
  invoiceId: string;
}
