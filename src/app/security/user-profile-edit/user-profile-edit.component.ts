import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrl: './user-profile-edit.component.css',
})
export class UserProfileEditComponent {
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}
  ngOnInit(): void {
    this.loadUser();
  }

  userForm = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', [Validators.required]],
    email: ['', Validators.required],
    userName: ['', Validators.required],
  });

  onSubmit() {
    if (this.userForm.valid) {
      this.upateUser();
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };

    this.spinner.show('fullscreen');
    this.authService.editUserProfile(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
        this.router.navigate(['/']);
        this.spinner.hide('fullscreen');
      },
      error: (err) => {
        this.toastService.showError('Error actualizado usuario. ' + err);
        this.spinner.hide('fullscreen');
      },
    });
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/']);
  }

  clearForm() {
    this.userForm.reset();
    this.isEdit = false;
  }

  loadUser() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.spinner.show('fullscreen');
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.userService.getUserById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.userForm.setValue({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              userName: user.userName,
            });
          }
          this.spinner.hide('fullscreen');
        },
      });
  }
}
