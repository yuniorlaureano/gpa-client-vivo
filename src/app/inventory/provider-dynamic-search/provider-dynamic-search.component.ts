import { Component, Input, OnInit } from '@angular/core';
import { SelectModel } from '../../core/models/select-model';
import { ProviderModel } from '../models/provider.model';
import { ProviderService } from '../service/provider.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { FilterModel } from '../../core/models/filter.model';
import { SearchOptionsModel } from '../../core/models/search-options.model';
import { DEFAULT_SEARCH_PARAMS } from '../../core/models/util.constants';
import { processError } from '../../core/utils/error.utils';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'gpa-provider-dynamic-search',
  templateUrl: './provider-dynamic-search.component.html',
})
export class ProviderDynamicSearchComponent implements OnInit {
  @Input() disabled: boolean = false;
  @Input() onSelectedItem: (model: ProviderModel | null) => void = () => {};
  @Input() selectedItem: SelectModel<ProviderModel> | null = null;
  items: SelectModel<ProviderModel>[] = [];
  search: string = '';
  options: SearchOptionsModel = { ...DEFAULT_SEARCH_PARAMS, count: 0 };
  optionsSubject = new BehaviorSubject<SearchOptionsModel>(this.options);

  constructor(
    private providerService: ProviderService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  handleSelectedItem = (model: SelectModel<ProviderModel> | null) => {
    this.onSelectedItem(model?.value ?? null);
  };

  handleSearch = (search: string) => {
    this.options.search = search;
    this.optionsSubject.next({
      ...this.options,
    });
  };

  handleNext = (page: number) => {
    this.optionsSubject.next({
      ...this.options,
      page: page,
    });
  };

  handlePrevious = (page: number) => {
    this.optionsSubject.next({
      ...this.options,
      page: page,
    });
  };

  loadProviders() {
    let searchModel = new FilterModel();
    this.optionsSubject
      .pipe(
        switchMap((options) => {
          this.options = options;
          searchModel.page = options.page;
          searchModel.pageSize = options.pageSize;
          searchModel.search = options.search;
          return this.providerService.getProviders(searchModel);
        })
      )
      .subscribe({
        next: (data) => {
          this.items = data.data.map((provider) => {
            return {
              text: provider.name + ' - ' + provider.lastName,
              value: provider,
            };
          });
          this.options = {
            ...this.options,
            count: data.count,
          };
        },
        error: (error) => {
          processError(
            error.error || error,
            'Error cargando proveedores'
          ).forEach((err) => {
            this.errorService.addGeneralError(err);
          });
        },
      });
  }
}
