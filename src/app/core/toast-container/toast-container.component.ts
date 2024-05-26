import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../service/toast.service';
import { Toast } from '../models/toast.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'gpa-toasts',
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnDestroy(): void {
    this.toastService.clear();
  }

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  hide(toast: Toast) {
    this.toastService.remove(toast);
  }
}
