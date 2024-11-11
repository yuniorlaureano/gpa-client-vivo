import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'gpa-alert-modal',
  templateUrl: './alert-modal.component.html',
})
export class AlertModalComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Input() cancelText: string = 'Cerrar';

  constructor(public modal: NgbActiveModal) {}

  dismiss(): void {
    this.modal.dismiss();
  }
}
