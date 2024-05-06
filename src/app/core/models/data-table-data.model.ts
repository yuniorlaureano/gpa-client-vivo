import { DataTableOptionModel } from './data-table-option.model';
export interface DataTableDataModel<T> {
  data: T[];
  options: DataTableOptionModel;
}
