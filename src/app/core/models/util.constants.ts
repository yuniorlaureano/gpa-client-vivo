import { SearchModel } from './search.model';

export const DEFAULT_SEARCH_PARAMS: SearchModel = {
  page: 1,
  pageSize: 10,
  search: null,
  asQueryString: (): string => {
    return '';
  },
};
