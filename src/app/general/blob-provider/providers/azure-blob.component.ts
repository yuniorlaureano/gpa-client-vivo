import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AzurePModel } from '../../model/azure.model';

@Component({
  selector: 'gpa-azure-blob',
  templateUrl: './azure-blob.component.html',
})
export class AzureBlobComponent implements OnChanges {
  @Input() options: string | null | undefined = null;
  @Output() onOptionsChange = new EventEmitter<string>();

  isEdit = false;
  azureForm = this.formBuilder.group({
    connectionString: ['', Validators.required],
    publicContainer: ['', Validators.required],
    privateContainer: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      const azureModel = JSON.parse(this.options) as AzurePModel;
      this.azureForm.patchValue(azureModel);
    }
  }

  handleInputChange() {
    if (this.azureForm.invalid) {
      return;
    }
    const azureModel = this.azureForm.value as AzurePModel;
    this.onOptionsChange.emit(JSON.stringify(azureModel));
  }
}
