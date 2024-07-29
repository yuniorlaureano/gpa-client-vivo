export interface EmailConfigurationModel {
  id: string | null;
  value: string | null;
  from: string;
  identifier: string;
  engine: string;
  current: boolean;
}
