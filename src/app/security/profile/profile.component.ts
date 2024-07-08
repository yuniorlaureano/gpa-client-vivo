import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { ProfileService } from '../service/profile.service';
import { ProfileModel } from '../model/profile.model';

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
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
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

    this.profileService.updateProfile(value as ProfileModel).subscribe({
      next: () => {
        this.handleReloadTable();
        this.clearForm();
        this.toastService.showSucess('Usuario actualizado');
      },
      error: (err) =>
        this.toastService.showError('Error actualizado usuario. ' + err),
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

  handleDelete(model: ProfileModel) {}
}
