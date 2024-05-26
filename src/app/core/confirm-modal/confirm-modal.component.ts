import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'gpa-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Input() okText: string = 'OK';
  @Input() cancelText: string = 'Cancel';

  constructor(public modal: NgbActiveModal) {}

  confim(): void {
    this.modal.close();
  }

  dismiss(): void {
    this.modal.dismiss();
  }
}
