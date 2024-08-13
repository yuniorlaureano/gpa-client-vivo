import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GCPModel } from '../../model/gcp.model';

@Component({
  selector: 'gpa-gcp-blob',
  templateUrl: './gcp-blob.component.html',
})
export class GcpBlobComponent implements OnChanges {
  @Input() options: string | null | undefined = null;
  @Output() onOptionsChange = new EventEmitter<string>();

  isEdit = false;
  gcpForm = this.formBuilder.group({
    jsonCredentials: ['', Validators.required],
    bucket: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      const gcpModel = JSON.parse(this.options) as GCPModel;
      this.gcpForm.patchValue(gcpModel);
    }
  }

  handleInputChange() {
    if (this.gcpForm.invalid) {
      return;
    }
    const gcpModel = this.gcpForm.value as GCPModel;
    this.onOptionsChange.emit(JSON.stringify(gcpModel));
  }
}
