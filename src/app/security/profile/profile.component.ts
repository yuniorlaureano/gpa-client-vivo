import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../../core/service/toast.service';
import { ProfileService } from '../service/profile.service';
import { ProfileModel } from '../model/profile.model';
import { Profile } from '../../core/models/profile.type';
import { ModalService } from '../../core/service/modal.service';
import { ConfirmModalService } from '../../core/service/confirm-modal.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'gpa-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  isEdit: boolean = false;
  reloadTable: number = 1;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    private modalService: ModalService,
    private spinner: NgxSpinnerService
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

    this.profileService.addProfile(value as ProfileModel).subscribe({
      next: () => {
        this.handleReloadTable();
        this.clearForm();
        this.toastService.showSucess('Profile agregado');
      },
      error: (err) =>
        this.toastService.showError('Error agregando profile. ' + err),
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
      error: (err) => {
        this.toastService.showError('Error actualizado usuario. ' + err);
        this.spinner.hide('fullscreen');
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

  //handleShowUser
  handleShowUser(model: ProfileModel) {
    let users = this.profileService.getUsers(model.id!);
    // this.modalService
    //   .show('Permisos para: ' + model.name, ul.join(''))
    //   .then(() => {})
    //   .catch(() => {});
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

  handleDelete(model: ProfileModel) {}
}
