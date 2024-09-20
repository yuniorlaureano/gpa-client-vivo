import { Component } from '@angular/core';
import { UserModel } from '../model/user.model';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { ToastService } from '../../core/service/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { Subscription } from 'rxjs';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';

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
    private confirmService: ConfirmModalService,
    private errorService: ErrorService
  ) {}

  handleEdit(user: UserModel) {
    this.router.navigate(['/auth/users/edit/' + user.id]);
  }

  handleDelete(user: UserModel) {
    this.confirmService
      .confirm(
        'Usuario',
        'Está seguro de eliminar el usuario:\n ' + user.userName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.userService.removeUser(user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(
              error.error || error,
              'Error eliminando usuario'
            ).forEach((err) => {
              this.errorService.addGeneralError(err);
            });
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }

  handleEnable(user: UserModel) {
    this.confirmService
      .confirm(
        'Usuario',
        'Está seguro de activar el usuario:\n ' + user.userName
      )
      .then(() => {
        this.spinner.show('fullscreen');
        const sub = this.userService.enableUser(user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario activado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            processError(
              error.error || error,
              'Error activando usuario'
            ).forEach((err) => {
              this.errorService.addGeneralError(err);
            });
          },
        });
        this.subscriptions$.push(sub);
      })
      .catch(() => {});
  }
}
