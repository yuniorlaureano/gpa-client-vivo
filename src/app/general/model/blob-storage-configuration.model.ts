export interface BlobStorageConfigurationModel {
  id: string | null;
  value: string | null;
  identifier: string;
  provider: string;
  current: boolean;
}
