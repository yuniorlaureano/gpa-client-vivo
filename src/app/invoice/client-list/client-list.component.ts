import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClientModel } from '../model/client.model';

@Component({
  selector: 'gpa-sale-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent {
  constructor(private router: Router) {}

  handleEdit(client: ClientModel) {
    this.router.navigate(['/invoice/client/edit/' + client.id]);
  }

  handleDelete(client: ClientModel) {
    this.router.navigate(['/invoice/client/edit/' + client.id]);
  }
}
