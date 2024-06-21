import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AddonModel } from '../models/addon.model';

@Component({
  selector: 'gpa-addon-list',
  templateUrl: './addon-list.component.html',
})
export class AddonListComponent {
  constructor(private router: Router) {}

  handleEdit(addon: AddonModel) {
    this.router.navigate(['/inventory/addon/edit/' + addon.id]);
  }

  handleDelete(addon: AddonModel) {
    // this.router.navigate(['/invoice/sale/edit/' + invoice.id]);
  }
}
