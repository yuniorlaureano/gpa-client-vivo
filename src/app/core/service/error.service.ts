import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AddError } from '../ng-xs-store/actions/app.actions';

@Injectable()
export class ErrorService {
  constructor(private store: Store) {}

  addError(error: any, callback?: () => void) {
    if (error.status === 403) {
      if (typeof error.error === 'string') {
        this.store.dispatch(new AddError(error.error));
        if (callback) {
          callback();
        }
      }
    }
  }

  addGeneralError(error: string) {
    if (error.length > 5) {
      this.store.dispatch(new AddError(error));
    }
  }
}
