import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ProductModel } from '../models/product.model';
import { ProductService } from '../service/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast.service';
import { UnitModel } from '../../common/model/unit.model';
import { UnitService } from '../../common/service/unit.service';
import { CategoryModel } from '../models/category.model';
import { CategoryService } from '../service/category.service';
import { ProductType } from '../../core/models/product-type.enum';

@Component({
  selector: 'gpa-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  minDate: NgbDateStruct;
  products: ProductModel[] = [];
  uploadedImage: any = null;
  isEdit: boolean = false;
  units$!: Observable<UnitModel[]>;
  categories$!: Observable<CategoryModel[]>;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private unitService: UnitService,
    private categoryService: CategoryService
  ) {
    // Esto es parte de la validacion general
    //sirve para que la fecha de expiracion no sea menor a la fecha actual
    const today = new Date();
    this.minDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }
  ngOnInit(): void {
    this.loadProduct();

    this.units$ = this.unitService.getUnits().pipe(map((data) => data.data));
    this.categories$ = this.categoryService
      .getCategory()
      .pipe(map((data) => data.data));
  }

  productForm = this.fb.group({
    id: [''],
    code: ['', Validators.required],
    name: ['', Validators.required],
    price: [0.0, [Validators.required]],
    description: ['', Validators.required],
    barCode: ['', Validators.required],
    expirationDate: ['', Validators.required],
    unitId: ['', Validators.required],
    categoryId: ['', Validators.required],
    type: [
      ProductType.FinishedProduct,
      [Validators.required, Validators.min(1), Validators.max(2)],
    ],
  });

  //Validaciones generales para los campos del formulario
  currentDate: Date = new Date();
  //
  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field) as FormControl;
    return (
      control &&
      control.touched &&
      control.errors &&
      'required' in control.errors &&
      control.errors['required']
    );
  }
  //

  onFileUploaded(file: any) {
    this.uploadedImage = file;
    // this.productForm.patchValue({ image: file.dataURL });
  }

  onSubmit() {
    if (this.productForm.valid) {
      if (!this.isEdit) {
        this.createProduct();
      } else {
        this.upateProduct();
      }
    } else {
      this.toastService.showError(
        'Debe llenar todos los campos del formulario'
      );
    }
  }

  createProduct() {
    this.productForm.get('id')?.setValue(null);
    this.productService
      .addProduct(this.productForm.value as ProductModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Producto agregado');
        },
        error: (err) =>
          this.toastService.showSucess('Error agregando producto. ' + err),
      });
  }

  upateProduct() {
    this.productService
      .updateProduct(this.productForm.value as ProductModel)
      .subscribe({
        next: () => {
          this.clearForm();
          this.toastService.showSucess('Producto actualizado');
        },
        error: (err) =>
          this.toastService.showSucess('Error actualizado producto. ' + err),
      });
  }

  handleCancel() {
    this.clearForm();
    this.router.navigate(['/inventory/product']);
  }

  clearForm() {
    this.productForm.reset();
    this.isEdit = false;
  }

  loadProduct() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            return this.productService.getProductById(id);
          } else {
            this.isEdit = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (product) => {
          if (product) {
            this.productForm.setValue({
              id: product.id,
              code: product.code,
              name: product.name,
              price: product.price,
              description: product.description,
              barCode: product.barCode,
              expirationDate: product.expirationDate,
              unitId: product.unitId,
              categoryId: product.categoryId,
              type: product.type,
            });
          }
        },
      });
  }
}
