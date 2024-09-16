import { Component } from '@angular/core';
import { UserModel } from '../model/user.model';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';

@Component({
  selector: 'gpa-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  reloadTable: number = 1;
  subscriptions$: Subscription[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private confirmService: ConfirmModalService
  ) {}

  handleEdit(user: UserModel) {
    this.router.navigate(['/auth/users/edit/' + user.id]);
  }

  handleDelete(user: UserModel) {
    this.confirmService
      .confirm(
        'Perfil',
        'Está seguro de eliminar el usuario:\n ' + user.userName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.userService.removeUser(user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Perfil eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(
              error.error || error,
              'Error eliminando perfil'
            ).forEach((err) => {
              this.toastService.showError(err);
            });
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
