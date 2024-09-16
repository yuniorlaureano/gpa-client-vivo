import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { FilterModel } from '../../../core/models/filter.model';
import { SearchOptionsModel } from '../../../core/models/search-options.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../../core/service/toast.service';
import { AddonService } from '../../service/addon.service';
import { ProductByAddonModel } from '../../models/product-by-addon.model';
import { processError } from '../../../core/utils/error.utils';
import { ErrorService } from '../../../core/service/error.service';

@Component({
  selector: 'gpa-addon-product-catalog',
  templateUrl: './addon-product-catalog.component.html',
  styleUrl: './addon-product-catalog.component.css',
})
export class AddonProductCatalogComponent implements OnInit, OnDestroy {
  @Input() addonId: string = '';
  pageOptionsSubject = new BehaviorSubject<SearchOptionsModel>({
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  });
  products!: ProductByAddonModel[];
  options: SearchOptionsModel = {
    count: 0,
    page: 1,
    pageSize: 10,
    search: null,
  };
  searchTerms = new Subject<string>();
  subscriptions$: Subscription[] = [];
  searchParams: { term: string | null; selected: number | null } = {
    term: null,
    selected: null,
  };

  constructor(
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private addonService: AddonService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initSearch();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  handleForwardPage() {
    const totalPages = Math.ceil(this.options.count / this.options.pageSize);
    if (this.options.page < totalPages) {
      this.options = {
        ...this.options,
        page: this.options.page + 1,
      };
      this.pageOptionsSubject.next(this.options);
    }
  }

  handleBackwardPage() {
    if (this.options.page > 1) {
      this.options = {
        ...this.options,
        page: this.options.page - 1,
      };
      this.pageOptionsSubject.next(this.options);
    }
  }

  handleSearch(event: any) {
    this.spinner.show('product-catalog-spinner');
    this.searchParams = { ...this.searchParams, term: event.target.value };
    this.searchTerms.next(JSON.stringify(this.searchParams));
  }

  handleSearchBySelected(event: any) {
    this.spinner.show('product-catalog-spinner');
    this.searchParams = {
      ...this.searchParams,
      selected: Number(event.target.value),
    };
    this.searchTerms.next(JSON.stringify(this.searchParams));
  }

  initSearch() {
    const sub = this.searchTerms
      .pipe(
        debounceTime(300) // Adjust the time (in milliseconds) as needed
      )
      .subscribe((search) => {
        this.pageOptionsSubject.next({ ...this.options, search: search });
      });
    this.subscriptions$.push(sub);
  }

  loadProducts() {
    const search = new FilterModel();
    const sub = this.pageOptionsSubject
      .pipe(
        switchMap((options) => {
          this.spinner.show('product-catalog-spinner');
          search.page = options.page;
          search.search = options.search;
          return this.addonService.getProductsByAddonId(this.addonId, search);
        })
      )
      .subscribe({
        next: (model) => {
          this.products = model.data;
          this.options = {
            ...this.options,
            count: model.count,
          };
          this.spinner.hide('product-catalog-spinner');
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando productos'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('product-catalog-spinner');
        },
      });
    this.subscriptions$.push(sub);
  }

  handleProductSelection(event: any, product: ProductByAddonModel) {
    if (event.target.checked) {
      this.spinner.show('product-catalog-spinner');
      const sub = this.addonService
        .assignAddonToProductAsync(this.addonId, product.id)
        .subscribe({
          next: () => {
            this.toastService.showSucess('Agregado asignado correctamente');
            this.spinner.hide('product-catalog-spinner');
          },
          error: (error) => {
            processError(
              error.error || error,
              'Error asignado agregado'
            ).forEach((err) => {
              this.errorService.addGeneralError(err);
            });
            this.spinner.hide('product-catalog-spinner');
          },
        });
      this.subscriptions$.push(sub);
    } else {
      this.spinner.show('product-catalog-spinner');
      const sub = this.addonService
        .removeAddonFromProductAsync(this.addonId, product.id)
        .subscribe({
          next: () => {
            this.toastService.showSucess('Agregado removido correctamente');
            this.spinner.hide('product-catalog-spinner');
            this.searchTerms.next(JSON.stringify(this.searchParams));
          },
          error: (error) => {
            processError(
              error.error || error,
              'Error removiendo agregado'
            ).forEach((err) => {
              this.errorService.addGeneralError(err);
            });
            this.spinner.hide('product-catalog-spinner');
            this.searchTerms.next(JSON.stringify(this.searchParams));
          },
        });
      this.subscriptions$.push(sub);
    }
  }

  handleProductSelectionAll() {
    this.spinner.show('product-catalog-spinner');
    const sub = this.addonService
      .assignAddonToAllProductAsync(this.addonId)
      .subscribe({
        next: () => {
          this.toastService.showSucess('Agregado asignado correctamente');
          this.spinner.hide('product-catalog-spinner');
          this.searchTerms.next(JSON.stringify(this.searchParams));
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error asignando usuarios a agregado'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('product-catalog-spinner');
          this.searchTerms.next(JSON.stringify(this.searchParams));
        },
      });
    this.subscriptions$.push(sub);
  }

  handleProductRemovalAll() {
    this.spinner.show('product-catalog-spinner');
    const sub = this.addonService
      .removeAddonFromAllProductAsync(this.addonId)
      .subscribe({
        next: () => {
          this.toastService.showSucess('Agregado removido correctamente');
          this.spinner.hide('product-catalog-spinner');
          this.searchTerms.next(JSON.stringify(this.searchParams));
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error removiendo agregados'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
          this.spinner.hide('product-catalog-spinner');
          this.searchTerms.next(JSON.stringify(this.searchParams));
        },
      });
    this.subscriptions$.push(sub);
  }
}
