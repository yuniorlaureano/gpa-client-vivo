import { Injectable } from '@angular/core';
import { Toast } from '../models/toast.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ToastService {
  toasts$: BehaviorSubject<Toast[]> = new BehaviorSubject<Toast[]>([]);

  remove(toast: Toast) {
    var value = this.toasts$.value.filter((x) => x != toast);
    this.toasts$.next(value);
  }

  clear() {
    this.toasts$.next([]);
  }

  showSucess(message: string, delay: number = 5000) {
    const sucess = {
      classname: 'bg-success text-light',
      message,
      delay,
    };
    this.toasts$.next([...this.toasts$.value, sucess]);
  }

  showError(message: string, delay: number = 5000) {
    const sucess = {
      classname: 'bg-danger text-light',
      delay,
      message,
    };
    this.toasts$.next([...this.toasts$.value, sucess]);
  }

  showStandard(message: string, delay: number = 5000) {
    const sucess = {
      delay,
      message,
    };
    this.toasts$.next([...this.toasts$.value, sucess]);
  }
}
