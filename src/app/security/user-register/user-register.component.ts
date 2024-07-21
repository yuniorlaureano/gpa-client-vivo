import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { of, switchMap } from 'rxjs';
import { ProfileModel } from '../model/profile.model';

@Component({
  selector: 'gpa-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent {
  isEdit: boolean = false;
  profiles: ProfileModel[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
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
      if (!this.isEdit) {
        this.creaUser();
      } else {
        this.upateUser();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  creaUser() {
    this.userForm.get('id')?.setValue(null);
    const value = {
      ...this.userForm.value,
    };

    this.userService.addUser(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario agregado');
      },
      error: (error) => {
        this.toastService.showError('Error al agregar usuario. ');
      },
    });
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };

    this.userService.updateUser(value as UserModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
      },
      error: (err) =>
        this.toastService.showError('Error actualizado usuario. ' + err),
    });
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/auth/users/register']);
  }

  clearForm() {
    this.userForm.reset();
    this.isEdit = false;
  }

  loadUser() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
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
            this.profiles = user.profiles;
          }
        },
        error: (error) => {
          this.toastService.showError('Error cargando usuario. ');
        },
      });
  }
}
