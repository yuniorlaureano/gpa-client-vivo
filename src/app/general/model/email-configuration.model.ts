export interface EmailConfigurationModel {
  id: string | null;
  provider: string;
  value: string;
  from: string;
  current: string;
}
