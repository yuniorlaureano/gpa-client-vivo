import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SendgridModel } from '../../model/sendgrid.model';

@Component({
  selector: 'gpa-sendgrid',
  templateUrl: './sendgrid.component.html',
})
export class SendgridComponent implements OnChanges {
  @Input() options: string | null | undefined = null;
  @Output() onOptionsChange = new EventEmitter<string>();

  isEdit = false;
  sendgridForm = this.formBuilder.group({
    apikey: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      const sendgridModel = JSON.parse(this.options) as SendgridModel;
      this.sendgridForm.patchValue(sendgridModel);
    }
  }

  handleInputChange() {
    if (this.sendgridForm.invalid) {
      return;
    }
    const sendgridModel = this.sendgridForm.value as SendgridModel;
    this.onOptionsChange.emit(JSON.stringify(sendgridModel));
  }
}
