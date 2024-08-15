import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AWSS3Model } from '../../model/awss3.model';

@Component({
  selector: 'gpa-aws-blob',
  templateUrl: './aws-blob.component.html',
})
export class AwsBlobComponent implements OnChanges {
  @Input() options: string | null | undefined = null;
  @Output() onOptionsChange = new EventEmitter<string>();

  isEdit = false;
  s3Form = this.formBuilder.group({
    accessKeyId: ['', Validators.required],
    secretAccessKey: ['', Validators.required],
    publicBucket: ['', Validators.required],
    privatgeBucket: ['', Validators.required],
    region: ['', Validators.required],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.options) {
      const awss3Model = JSON.parse(this.options) as AWSS3Model;
      this.s3Form.patchValue(awss3Model);
    }
  }

  handleInputChange() {
    if (this.s3Form.invalid) {
      return;
    }
    const awss3Model = this.s3Form.value as AWSS3Model;
    this.onOptionsChange.emit(JSON.stringify(awss3Model));
  }
}
