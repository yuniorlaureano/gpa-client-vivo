import { PermissionType } from '../../core/models/permission.type';

export interface TokenModel {
  token: string;
  permissions: PermissionType;
}
