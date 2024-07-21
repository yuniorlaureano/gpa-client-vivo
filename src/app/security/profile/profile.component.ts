import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../core/service/toast.service';
import { ProfileService } from '../service/profile.service';
import { ProfileModel } from '../model/profile.model';
import { Profile } from '../../core/models/profile.type';
import { ModalService } from '../../core/service/modal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { RawUserModel } from '../model/raw-user.model';

@Component({
  selector: 'gpa-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  isEdit: boolean = false;
  reloadTable: number = 1;
  isProfileUserCatalogVisible: boolean = false;
  reloadProfileUserTable: number = 1;
  selectedProfile!: ProfileModel | null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    private modalService: ModalService,
    private spinner: NgxSpinnerService,
    private confirmService: ConfirmModalService
  ) {}

  profileForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
  });

  onSubmit() {
    if (this.profileForm.valid) {
      if (!this.isEdit) {
        this.creaProfile();
      } else {
        this.upateProfile();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  creaProfile() {
    this.profileForm.get('id')?.setValue(null);
    const value = {
      ...this.profileForm.value,
    };
    this.spinner.show('fullscreen');
    this.profileService.addProfile(value as ProfileModel).subscribe({
      next: () => {
        this.handleReloadTable();
        this.clearForm();
        this.toastService.showSucess('Profile agregado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        this.toastService.showError('Error creado perfil');
      },
    });
  }

  upateProfile() {
    const value = {
      ...this.profileForm.value,
    };

    this.spinner.show('fullscreen');
    this.profileService.updateProfile(value as ProfileModel).subscribe({
      next: () => {
        this.handleReloadTable();
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
        this.spinner.hide('fullscreen');
      },
      error: (error) => {
        this.spinner.hide('fullscreen');
        this.toastService.showError('Error al actualizar el usuario');
      },
    });
  }

  handleCancel() {
    this.clearForm();
  }

  clearForm() {
    this.profileForm.reset();
    this.isEdit = false;
  }

  handleReloadTable() {
    this.reloadTable = this.reloadTable * -1;
  }

  handleEdit(model: ProfileModel) {
    this.isEdit = true;
    this.profileForm.setValue({
      id: model.id,
      name: model.name,
    });
  }

  handleDelete(model: ProfileModel) {
    this.confirmService
      .confirm('Perfil', 'Está seguro de eliminar el perfil:\n ' + model.name)
      .then(() => {
        this.spinner.show('fullscreen');
        this.profileService.removeProfile(model.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Perfil eliminado');
            this.reloadTable = this.reloadTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error elimiando perfil');
          },
        });
      })
      .catch(() => {});
  }

  handleAddUser(model: ProfileModel) {
    this.selectedProfile = model;
    this.isProfileUserCatalogVisible = true;
    this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
  }

  handdleUserAdded(user: RawUserModel) {
    this.handleAssignPermission(this.selectedProfile, user);
  }

  handleAssignPermission(profile: ProfileModel | null, user: RawUserModel) {
    if (!profile) {
      return;
    }

    this.confirmService
      .confirm(
        'Perfil',
        'Está seguro de asignar el usuario:\n ' +
          user.email +
          ' al perfil: \n ' +
          profile.name
      )
      .then(() => {
        this.spinner.show('fullscreen');
        this.profileService.assignUser(profile.id!, user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario asignado');
            this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error asignando usuario');
          },
        });
      })
      .catch(() => {});
  }

  handdleUserRemoved(user: RawUserModel) {
    this.handleRemoveUser(this.selectedProfile, user);
  }

  handleRemoveUser(profile: ProfileModel | null, user: RawUserModel) {
    if (!profile) {
      return;
    }

    this.confirmService
      .confirm(
        'Perfil',
        'Está seguro de remover el usuario.\n ' +
          ' del perfil: \n ' +
          profile.name
      )
      .then(() => {
        this.spinner.show('fullscreen');
        this.profileService.removeUser(profile.id!, user.id!).subscribe({
          next: () => {
            this.toastService.showSucess('Usuario removido');
            this.reloadProfileUserTable = this.reloadProfileUserTable * -1;
            this.spinner.hide('fullscreen');
          },
          error: (error) => {
            this.spinner.hide('fullscreen');
            this.toastService.showError('Error removiendo usuario');
          },
        });
      })
      .catch(() => {});
  }

  handleView(model: ProfileModel) {
    this.spinner.show('fullscreen');
    let permissons: Profile[] = JSON.parse(model.value);
    let ul = [];
    let ulApp = [];
    let ulModule = [];
    let ulComponent = [];
    if (permissons) {
      for (let app of permissons) {
        ulApp.push('<ol style="list-style-type: disclosure-open">');
        ulApp.push('<li><h3>' + app.app + '</h3></li>');

        for (let module of app.modules) {
          ulModule.push('<ol style="list-style-type: disclosure-open">');
          ulModule.push('<li><h4>' + module.id + '</h4></li>');

          for (let component of module.components) {
            ulComponent.push('<ol style="list-style-type: disclosure-open">');
            ulComponent.push('<li><h5>' + component.id + '</h5></li>');
            ulComponent.push('<ol style="list-style-type: circle">');
            for (let permission of component.permissions) {
              ulComponent.push('<li>' + permission + '</li>');
            }
            ulComponent.push('</ol>');
            ulComponent.push('</ol>');
          }

          ulModule.push(ulComponent.join(''));
          ulModule.push('</ol>');
          ulComponent = [];
        }

        ulApp.push(ulModule.join(''));
        ulApp.push('</ol>');
        ul.push(ulApp.join(''));
        ulModule = [];
        ulApp = [];
      }
    }

    this.modalService
      .show('Permisos para: ' + model.name, ul.join(''))
      .then(() => {})
      .catch(() => {});
    this.spinner.hide('fullscreen');
  }
}
