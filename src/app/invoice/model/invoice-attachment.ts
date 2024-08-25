export interface InvoiceAttachModel {
  id: string;
  file: string;
  uploadedBy: string;
  uploadedAt: string;
  invoiceId: string;
  deserializedFile: {
    name: string;
    uniqueName: string;
  } | null;
}
