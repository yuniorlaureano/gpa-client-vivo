import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import {
  AddErrors,
  AddMessages,
  ClearErrors,
  ClearMessages,
  ReplaceMessages,
} from '../actions/auth.actions';
import { Injectable } from '@angular/core';

export interface AuthStateModel {
  errors: string[];
  messages: string[];
}

const ZOO_STATE_TOKEN = new StateToken<AuthStateModel>('auth');

@State<AuthStateModel>({
  name: ZOO_STATE_TOKEN,
  defaults: {
    errors: [],
    messages: [],
  },
})
@Injectable()
export class AuthState {
  @Selector()
  static getMessages(state: AuthStateModel): string[] {
    return state.messages;
  }

  @Action(AddErrors)
  addErrors(
    { patchState, getState }: StateContext<AuthStateModel>,
    { payload }: AddErrors
  ) {
    const state = getState();
    const errors = payload.filter((error) => {
      return state.errors.includes(error) === false;
    });
    patchState({
      errors: [...state.errors, ...errors],
    });
  }

  @Action(ClearErrors)
  removeErrors({ patchState }: StateContext<AuthStateModel>) {
    patchState({
      errors: [],
    });
  }

  @Action(AddMessages)
  addMessages(
    { patchState, getState }: StateContext<AuthStateModel>,
    { payload }: AddMessages
  ) {
    const state = getState();
    patchState({
      messages: [...state.messages, ...payload],
    });
  }

  @Action(ReplaceMessages)
  replaceMessages(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: ReplaceMessages
  ) {
    patchState({
      messages: [...payload],
    });
  }

  @Action(ClearMessages)
  removeMessages({ patchState }: StateContext<AuthStateModel>) {
    patchState({
      messages: [],
    });
  }
}
