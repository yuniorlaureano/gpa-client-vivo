import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { AddonService } from '../service/addon.service';
import { AddonModel, AddonType } from '../models/addon.model';

@Component({
  selector: 'gpa-addon',
  templateUrl: './addon.component.html',
  styleUrl: './addon.component.css',
})
export class AddonComponent implements OnInit {
  isEdit = false;
  addonForm = this.formBuilder.group({
    id: [''],
    concept: ['', Validators.required],
    isDiscount: [true, Validators.required],
    type: ['PERCENTAGE', Validators.required],
    value: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private addonService: AddonService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAddon();
  }

  saveAddon() {
    this.addonForm.markAllAsTouched();
    if (this.addonForm.valid) {
      const value = {
        ...this.addonForm.value,
        value: Number(this.addonForm.get('value')?.value),
      };
      if (this.isEdit) {
        this.addonService.updateAddon(<AddonModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Agregado modificado');
          },
          error: (err) =>
            this.toastService.showSucess('Error modificando agregado. ' + err),
        });
      } else {
        value.id = null;
        this.addonService.addAddon(<AddonModel>value).subscribe({
          next: () => {
            this.clearForm();
            this.toastService.showSucess('Agregado creada');
          },
          error: (err) =>
            this.toastService.showSucess('Error creando agregado. ' + err),
        });
      }
    }
  }

  loadAddon() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.addonService.getAddonById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (addon) => {
          if (addon) {
            this.addonForm.setValue({
              id: addon.id,
              concept: addon.concept,
              isDiscount: addon.isDiscount,
              type: addon.type,
              value: addon.value.toString(),
            });
          }
        },
      });
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/inventory/addon']);
  }

  clearForm() {
    this.addonForm.reset();
    this.isEdit = false;
  }
}
