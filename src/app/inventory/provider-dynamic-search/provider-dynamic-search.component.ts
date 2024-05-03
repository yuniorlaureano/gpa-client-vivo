import { Component, Input, OnInit } from '@angular/core';
import { SelectModel } from '../../core/models/select-model';
import { ProviderModel } from '../models/provider.model';
import { ProviderService } from '../service/provider.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { SearchModel } from '../../core/models/search.model';

@Component({
  selector: 'gpa-provider-dynamic-search',
  templateUrl: './provider-dynamic-search.component.html',
})
export class ProviderDynamicSearchComponent implements OnInit {
  @Input() onSelectedItem: (model: ProviderModel | null) => void = () => {};
  @Input() selectedItem: SelectModel<ProviderModel> | null = null;
  items: SelectModel<ProviderModel>[] = [];
  search: string = '';
  options: { count: number; page: number; pageSize: number } = {
    count: 0,
    page: 1,
    pageSize: 10,
  };

  optionsSubject = new BehaviorSubject<{
    count: number;
    page: number;
    pageSize: number;
  }>(this.options);

  constructor(private providerService: ProviderService) {}

  ngOnInit(): void {
    this.loadProviders();
    //this.search
  }

  handleSelectedItem = (model: SelectModel<ProviderModel> | null) => {
    this.onSelectedItem(model?.value ?? null);
  };

  handleSearch = (search: string) => {
    this.search = search;
    this.optionsSubject.next({
      ...this.options,
    });
    //search  todo: pass the search to this when implemented
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
    //this.search
  };

  loadProviders() {
    this.optionsSubject
      .pipe(
        switchMap((options) => {
          this.options = options;

          return this.providerService.getProviders(
            new SearchModel(options.page, options.pageSize)
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.items = data.data.map((provider) => {
            return {
              text: provider.name + ' - ' + provider.rnc,
              value: provider,
            };
          });
          this.options = {
            ...this.options,
            count: data.count,
          };
        },
      });
  }
}
