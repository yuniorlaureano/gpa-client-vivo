export interface StockAttachModel {
  id: string;
  file: string;
  uploadedBy: string;
  uploadedAt: string;
  stockId: string;
  deserializedFile: {
    name: string;
    uniqueName: string;
  } | null;
}
