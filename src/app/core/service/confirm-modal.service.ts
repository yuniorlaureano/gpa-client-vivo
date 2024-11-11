import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Injectable()
export class ConfirmModalService {
  constructor(private modalService: NgbModal) {}

  confirm(
    title: string,
    message: string,
    okText: string = 'OK',
    cancelText: string = 'Cancel',
    dialogSize: 'sm' | 'lg' = 'sm'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: dialogSize,
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.okText = okText;
    modalRef.componentInstance.cancelText = cancelText;

    return modalRef.result;
  }

  alert(
    title: string,
    message: string,
    cancelText: string = 'Cerrar',
    dialogSize: 'sm' | 'lg' = 'sm'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(AlertModalComponent, {
      size: dialogSize,
    });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.cancelText = cancelText;

    return modalRef.result;
  }
}
