export interface RawAllInvoice {
  id: string;
  status: number;
  code: string;
  payment: number;
  toPay: number;
  paymentStatus: number;
  paymentMethod: number;
  type: number;
  date: string;
  note: string;
  clientId: string;
  clientName: string;
  clientLastName: string;
  createdByName: string;
  updatedByName: string;
}
