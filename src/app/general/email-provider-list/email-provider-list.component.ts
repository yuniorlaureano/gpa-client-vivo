import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailConfigurationModel } from '../model/email-configuration.model';

@Component({
  selector: 'gpa-email-provider-list',
  templateUrl: './email-provider-list.component.html',
})
export class EmailProviderListComponent {
  constructor(private router: Router) {}

  handleEdit(emailProvider: EmailConfigurationModel) {
    this.router.navigate(['/general/emails/edit/' + emailProvider.id]);
  }

  handleDelete(emailProvider: EmailConfigurationModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
