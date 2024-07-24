import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import {
  AddError,
  AddPermissions,
  AddRequiredPermissions,
  RemoveError,
  SetProfiles,
} from '../actions/app.actions';
import { PermissionType } from '../../models/permission.type';
import { Injectable } from '@angular/core';
import {
  ModuleRequiredPermissionType,
  RequiredPermissionType,
} from '../../models/required-permission.type';
import * as PermissionConstants from '../../models/profile.constants';
import * as ProfileUtils from '../../utils/profile.utils';
import { ProfileModel } from '../../../security/model/profile.model';

export interface AppStateModel {
  errors: string[];
  permissions: PermissionType;
  profiles: ProfileModel[];
  requiredPermissions: ModuleRequiredPermissionType;
}

const ZOO_STATE_TOKEN = new StateToken<AppStateModel>('app');

@State<AppStateModel>({
  name: ZOO_STATE_TOKEN,
  defaults: {
    errors: [],
    permissions: {},
    profiles: [],
    requiredPermissions: getRequiredPermissions(),
  },
})
@Injectable()
export class AppState {
  @Selector()
  static getErrors(state: AppStateModel): string[] {
    return state.errors;
  }

  @Selector()
  static getPermissions(state: AppStateModel): ModuleRequiredPermissionType {
    return state.requiredPermissions;
  }

  @Selector()
  static getProfiles(state: AppStateModel): ProfileModel[] {
    return state.profiles;
  }

  @Action(AddError)
  addError(
    { patchState, getState }: StateContext<AppStateModel>,
    { payload }: AddError
  ) {
    const state = getState();
    patchState({
      errors: [...state.errors, payload],
    });
  }

  @Action(RemoveError)
  removeError(
    { patchState, getState }: StateContext<AppStateModel>,
    payload: RemoveError
  ) {
    const state = getState();
    patchState({
      errors: [...state.errors.filter((error) => error !== payload.error)],
    });
  }

  @Action(AddPermissions)
  addPermissions(
    { patchState }: StateContext<AppStateModel>,
    payload: AddPermissions
  ) {
    patchState({
      permissions: { ...payload.permissions },
    });
  }

  @Action(SetProfiles)
  setProfiles(
    { patchState }: StateContext<AppStateModel>,
    payload: SetProfiles
  ) {
    patchState({
      profiles: { ...payload.profiles },
    });
  }

  @Action(AddRequiredPermissions)
  addRequiredPermissions(
    { patchState }: StateContext<AppStateModel>,
    payload: AddRequiredPermissions
  ) {
    let requiredPermissions = getRequiredPermissions();
    ProfileUtils.hasPermissionByRequiredPermissionForModules(
      payload.permissions,
      requiredPermissions,
      PermissionConstants.Apps.GPA
    );

    patchState({
      requiredPermissions: requiredPermissions,
      permissions: { ...payload.permissions },
    });
  }
}

function getRequiredPermissions(): ModuleRequiredPermissionType {
  return {
    [PermissionConstants.Modules.Security]: {
      [PermissionConstants.Components.Profile]: profilePermission(),
      [PermissionConstants.Components.User]: userPermission(),
    },
    [PermissionConstants.Modules.Common]: {
      [PermissionConstants.Components.Auth]: authPermission(),
    },
    [PermissionConstants.Modules.Inventory]: {
      [PermissionConstants.Components.Product]: productPermission(),
      [PermissionConstants.Components.StockCycle]: stockCyclePermission(),
      [PermissionConstants.Components.Category]: categoryPermission(),
      [PermissionConstants.Components.Addon]: addonPermission(),
      [PermissionConstants.Components.Stock]: stockPermission(),
    },
    [PermissionConstants.Modules.Invoice]: {
      [PermissionConstants.Components.Invoicing]: invoicePermission(),
      [PermissionConstants.Components.ReceivableAccount]:
        receivabelAccountPermission(),
    },
  };
}

function profilePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    assignProfile: {
      expected: PermissionConstants.Permission.AssignProfile,
      valid: false,
    },
    unAssignProfile: {
      expected: PermissionConstants.Permission.UnAssignProfile,
      valid: false,
    },
  };
}

function userPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function authPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    updateUserProfile: {
      expected: PermissionConstants.Permission.UpdateUserProfile,
      valid: false,
    },
  };
}

function productPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function stockCyclePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function categoryPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function addonPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}

function stockPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    'add-input': {
      expected: PermissionConstants.Permission.RegisterInput,
      valid: false,
    },
    'add-output': {
      expected: PermissionConstants.Permission.RegisterOutput,
      valid: false,
    },
    cancel: {
      expected: PermissionConstants.Permission.Cancel,
      valid: false,
    },
    'update-input': {
      expected: PermissionConstants.Permission.UpdateInput,
      valid: false,
    },
    'update-output': {
      expected: PermissionConstants.Permission.UpdateOutput,
      valid: false,
    },
    'read-products': {
      expected: PermissionConstants.Permission.ReadProducts,
      valid: false,
    },
    'read-existence': {
      expected: PermissionConstants.Permission.ReadExistence,
      valid: false,
    },
    'read-transactions': {
      expected: PermissionConstants.Permission.ReadTransactions,
      valid: false,
    },
  };
}

function invoicePermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
    return: {
      expected: PermissionConstants.Permission.Return,
      valid: false,
    },
  };
}

function receivabelAccountPermission(): RequiredPermissionType {
  return {
    create: {
      expected: PermissionConstants.Permission.Create,
      valid: false,
    },
    update: {
      expected: PermissionConstants.Permission.Update,
      valid: false,
    },
    delete: {
      expected: PermissionConstants.Permission.Delete,
      valid: false,
    },
    read: {
      expected: PermissionConstants.Permission.Read,
      valid: false,
    },
  };
}
