import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { ClientModel } from '../model/client.model';
import { ClientService } from '../service/client.service';
import { ClientCreditModel } from '../model/client-credit.model';

@Component({
  selector: 'gpa-client',
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent implements OnInit {
  clients: ClientModel[] = [];
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.loadClient();
  }

  clientForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    credits: this.fb.array([]),
  });

  onSubmit() {
    this.clientForm.markAllAsTouched();
    this.credits.markAllAsTouched();
    if (this.clientForm.valid) {
      if (!this.isEdit) {
        this.createClient();
      } else {
        this.upateClient();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  createClient() {
    this.clientForm.get('id')?.setValue(null);
    const value = {
      ...this.clientForm.value,
    };

    this.clientService.addClient(value as ClientModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Cliente agregado');
      },
      error: (err) =>
        this.toastService.showSucess('Error agregando cliente. ' + err),
    });
  }

  upateClient() {
    const value = {
      ...this.clientForm.value,
    };

    this.clientService.updateClient(value as ClientModel).subscribe({
      next: () => {
        this.clearForm();
        this.toastService.showSucess('Cliente actualizado');
      },
      error: (err) =>
        this.toastService.showSucess('Error actualizado cliente. ' + err),
    });
  }

  get credits() {
    return this.clientForm.get('credits') as FormArray;
  }

  addCredit() {
    this.credits.push(
      this.fb.group({
        concept: ['', Validators.required],
        credit: [0, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeCredit(i: number) {
    this.credits.removeAt(i);
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/invoice/client']);
  }

  clearForm() {
    this.clientForm.reset();
    this.isEdit = false;
  }

  loadClient() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.clientService.getClientById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (client) => {
          if (client) {
            this.clientForm.setValue({
              id: client.id,
              name: client.name,
              lastName: client.lastName,
              identification: client.identification,
              credits: [],
            });
            this.mapCredits(client.credits);
          }
        },
      });
  }

  mapCredits(credits: ClientCreditModel[]) {
    if (credits) {
      for (let credit of credits) {
        this.credits.push(
          this.fb.group({
            concept: [credit.concept, Validators.required],
            credit: [credit.credit, [Validators.required, Validators.min(1)]],
          })
        );
      }
    }
  }
}
