import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import {
  AddError,
  AddPermissions,
  AddRequiredPermissions,
  CleanError,
  RemoveError,
  SetBlobProviders,
  SetCurrentMenu,
  SetCurrentSubMenu,
  SetProfiles,
  RefreshCredentials,
  MapLoaded,
  LoadReasons,
} from '../actions/app.actions';
import { PermissionType } from '../../models/permission.type';
import { Injectable } from '@angular/core';
import { ModuleRequiredPermissionType } from '../../models/required-permission.type';
import * as PermissionConstants from '../../models/profile.constants';
import * as ProfileUtils from '../../utils/profile.utils';
import { ProfileModel } from '../../../security/model/profile.model';
import { getRequiredPermissions } from './permissions';
import { BlobStorageConfigurationModel } from '../../../general/model/blob-storage-configuration.model';
import { ReasonModel } from '../../../inventory/models/reason.model';

export interface AppStateModel {
  errors: string[];
  permissions: PermissionType;
  profiles: ProfileModel[];
  requiredPermissions: ModuleRequiredPermissionType;
  blobProvider?: BlobStorageConfigurationModel;
  menu: string;
  submenu: string;
  mapLoaded: boolean;
  reasons: ReasonModel[];
}

const ZOO_STATE_TOKEN = new StateToken<AppStateModel>('app');

@State<AppStateModel>({
  name: ZOO_STATE_TOKEN,
  defaults: {
    errors: [],
    permissions: {},
    profiles: [],
    requiredPermissions: getRequiredPermissions(),
    blobProvider: {} as BlobStorageConfigurationModel,
    menu: '',
    submenu: '',
    mapLoaded: false,
    reasons: [],
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

  @Selector()
  static getMapLoaded(state: AppStateModel): boolean {
    return state.mapLoaded;
  }

  @Selector()
  static getReasons(state: AppStateModel): ReasonModel[] {
    return state.reasons;
  }

  @Action(AddError)
  addError(
    { patchState, getState }: StateContext<AppStateModel>,
    { payload }: AddError
  ) {
    const state = getState();
    if (!state.errors.includes(payload)) {
      patchState({
        errors: [...state.errors, payload],
      });
    }
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

  @Action(CleanError)
  cleanError({ patchState }: StateContext<AppStateModel>, payload: CleanError) {
    patchState({
      errors: [],
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

  @Action(SetBlobProviders)
  setBlobProvider(
    { patchState }: StateContext<AppStateModel>,
    payload: SetBlobProviders
  ) {
    if (payload.profiles) {
      patchState({
        blobProvider: { ...payload.profiles },
      });
    }
  }

  @Action(SetCurrentMenu)
  setCurrentMenu(
    { patchState, getState }: StateContext<AppStateModel>,
    payload: SetCurrentMenu
  ) {
    let state = getState();
    if (state.menu == payload.menu) {
      patchState({
        menu: '',
      });
    } else {
      patchState({
        menu: payload.menu,
      });
    }
  }

  @Action(SetCurrentSubMenu)
  setCurrentSubMenu(
    { patchState }: StateContext<AppStateModel>,
    payload: SetCurrentSubMenu
  ) {
    patchState({
      submenu: payload.submenu,
    });
  }

  @Action(RefreshCredentials)
  refreshCredentials(
    ctx: StateContext<AppStateModel>,
    action: RefreshCredentials
  ) {
    ctx.setState({
      ...ctx.getState(),
    });
  }

  @Action(MapLoaded)
  setMapLoaded(ctx: StateContext<AppStateModel>) {
    ctx.setState({
      ...ctx.getState(),
      mapLoaded: true,
    });
  }

  @Action(LoadReasons)
  setReasons(
    { patchState }: StateContext<AppStateModel>,
    payload: LoadReasons
  ) {
    patchState({
      reasons: payload.reasons,
    });
  }
}
