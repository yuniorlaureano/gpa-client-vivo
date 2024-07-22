import { ProfileModel } from '../../../security/model/profile.model';
import { PermissionType } from '../../models/permission.type';

export class AddError {
  static readonly type = '[App] AddError';
  constructor(public payload: string) {}
}

export class RemoveError {
  static readonly type = '[App] RemoveError';
  constructor(public error: string) {}
}

export class AddPermissions {
  static readonly type = '[App] AddPermissions';
  constructor(public permissions: PermissionType) {}
}

export class AddRequiredPermissions {
  static readonly type = '[App] AddRequiredPermissions';
  constructor(public permissions: PermissionType) {}
}

export class SetProfiles {
  static readonly type = '[App] SetProfiles';
  constructor(public profiles: ProfileModel[]) {}
}
