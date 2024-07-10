import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { PermissionService } from '../service/permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/service/toast.service';
import { UserModel } from '../model/user.model';
import { ProfileModel } from '../model/profile.model';

@Component({
  selector: 'gpa-profile-permission',
  templateUrl: './profile-permission.component.html',
  styleUrl: './profile-permission.component.css',
})
export class ProfilePermissionComponent {
  isEdit: boolean = false;
  profile: ProfileModel | null = null;

  masterProfile = {
    app: 'GPA',
    modules: [
      {
        id: 'inventory',
        components: [
          {
            id: 'addon',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'category',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'productLocation',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'product',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'provider',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'reason',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'stockCycle',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'stock',
            permissions: ['create', 'update', 'delete', 'read'],
          },
        ],
      },
      {
        id: 'invoice',
        components: [
          {
            id: 'client',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'invoice',
            permissions: ['create', 'update', 'delete', 'read'],
          },
          {
            id: 'receivableAccount',
            permissions: ['create', 'update', 'delete', 'read'],
          },
        ],
      },
      {
        id: 'report',
        components: [],
      },
      {
        id: 'security',
        components: [],
      },
      {
        id: 'common',
        components: [],
      },
    ],
  };

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.loadUser();

    //ToDo: Use this to paint the checkboxes and create the profile

    // let permissions = [];
    // processProfile(prof, [], permissions);
    // console.log(permissions);

    // let permissionsAsArrayOfTokens =
    //   splitPermissionPathsIntoArrayOfTokens(permissions);
    // console.log(permissionsAsArrayOfTokens);

    // var profile = {};
    // for (let permissionsAsArrayOfToken of permissionsAsArrayOfTokens) {
    //   buildProfileObjectFromArrayOfToken(profile, permissionsAsArrayOfToken);
    // }
    // console.log(profile);
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

    // this.permissionService.addPermission(value as UserModel).subscribe({
    //   next: () => {
    //     this.clearForm();
    //     this.toastService.showSucess('Usuario agregado');
    //   },
    //   error: (err) =>
    //     this.toastService.showError('Error agregando usuario. ' + err),
    // });
  }

  upateUser() {
    const value = {
      ...this.userForm.value,
    };

    // this.permissionService.updateUser(value as UserModel).subscribe({
    //   next: () => {
    //     this.clearForm();
    //     this.toastService.showSucess('Usuario actualizado');
    //   },
    //   error: (err) =>
    //     this.toastService.showError('Error actualizado usuario. ' + err),
    // });
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
            return this.permissionService.getPermissionById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (profile) => {
          this.profile = profile;
        },
      });
  }
}
