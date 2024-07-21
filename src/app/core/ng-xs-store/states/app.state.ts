import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { AddError, RemoveError } from '../actions/app.actions';

export interface AppStateModel {
  errors: string[];
}

const ZOO_STATE_TOKEN = new StateToken<AppStateModel>('app');

@State<AppStateModel>({
  name: ZOO_STATE_TOKEN,
  defaults: {
    errors: [],
  },
})
export class AppState {
  @Selector()
  static getErrors(state: AppStateModel): string[] {
    return state.errors;
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
}
