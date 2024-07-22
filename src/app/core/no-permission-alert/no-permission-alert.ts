import { Component, Input } from '@angular/core';

@Component({
  selector: 'gpa-no-permission-alert',
  templateUrl: './no-permission-alert.html',
})
export class NoPermissionAlertComponent {
  @Input() visible: boolean = false;
}
