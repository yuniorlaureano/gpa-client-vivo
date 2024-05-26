import { Component, Input } from '@angular/core';

@Component({
  selector: 'gpa-validator-message',
  templateUrl: './validator-message.component.html',
  styleUrl: './validator-message.component.css',
})
export class ValidatorMessageComponent {
  @Input() control!: any;
  @Input() validation!: string;
  @Input() message: string = '';
  @Input() touched: boolean = false;

  hasError() {
    return this.touched && this.control?.errors?.[this.validation];
  }
}
