import { FilterModel } from './filter.model';

export const DEFAULT_SEARCH_PARAMS: FilterModel = {
  page: 1,
  pageSize: 10,
  search: null,
  asQueryString: (): string => {
    return '';
  },
};
