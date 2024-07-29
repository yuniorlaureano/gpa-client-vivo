import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SmtpModel } from '../../model/smtp.model';

@Component({
  selector: 'gpa-smtp',
  templateUrl: './smtp.component.html',
})
export class SmtpComponent implements OnChanges {
  @Input() options: string | null | undefined = null;
  @Output() onOptionsChange = new EventEmitter<string>();

  isEdit = false;
  smtpForm = this.formBuilder.group({
    host: ['', Validators.required],
    userName: ['', Validators.required],
    password: ['', Validators.required],
    port: [0, Validators.required],
    useSsl: [true, Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      const smtpModel = JSON.parse(this.options) as SmtpModel;
      this.smtpForm.patchValue(smtpModel);
    }
  }

  handleInputChange() {
    if (this.smtpForm.invalid) {
      return;
    }
    const port = String(this.smtpForm.value.port);
    const smtpModel = {
      ...this.smtpForm.value,
      port: parseInt(port),
    };
    this.onOptionsChange.emit(JSON.stringify(smtpModel));
  }
}
