import { BlobStorageConfigurationModel } from '../../../general/model/blob-storage-configuration.model';
import { ReasonModel } from '../../../inventory/models/reason.model';
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

export class CleanError {
  static readonly type = '[App] CleanError';
  constructor() {}
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

export class SetBlobProviders {
  static readonly type = '[App] SetBlobProviders';
  constructor(public profiles?: BlobStorageConfigurationModel) {}
}

export class SetCurrentMenu {
  static readonly type = '[App] SetCurrentMenu';
  constructor(public menu: string) {}
}

export class SetCurrentSubMenu {
  static readonly type = '[App] SetCurrentSubMenu';
  constructor(public submenu: string) {}
}

export class RefreshCredentials {
  static readonly type = '[App] RefreshCredentials';
  constructor() {}
}

export class MapLoaded {
  static readonly type = '[App] MapLoaded';
  constructor() {}
}

export class LoadReasons {
  static readonly type = '[App] LoadReasons';
  constructor(public reasons: ReasonModel[]) {}
}
