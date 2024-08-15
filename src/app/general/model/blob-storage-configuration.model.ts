export interface BlobStorageConfigurationModel {
  id: string | null;
  value: string | null;
  identifier: string;
  publicUrl: string;
  provider: string;
  current: boolean;
}
