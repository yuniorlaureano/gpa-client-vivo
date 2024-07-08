import { Component } from '@angular/core';
import { UserModel } from '../model/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'gpa-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  constructor(private router: Router) {}

  handleEdit(user: UserModel) {
    this.router.navigate(['/auth/users/edit/' + user.id]);
  }

  handleDelete(user: UserModel) {
    this.router.navigate(['/auth/users/edit/' + user.id]);
  }
}
