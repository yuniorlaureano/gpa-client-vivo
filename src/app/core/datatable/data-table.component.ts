import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DataTableOptionModel } from '../../models/common/data-table-option.model';
import { DEFAULT_SEARCH_PARAMS } from '../../services/common/util.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() options: DataTableOptionModel = {
    ...DEFAULT_SEARCH_PARAMS,
    filteredSize: 0,
    count: 0,
  };

  @Input() onForwardPage: (page: number) => void = () => {};
  @Input() onBackwardPage: (page: number) => void = () => {};
  @Input() onSetPageToShow: (pageCount: number) => void = () => {};

  handleForwardPage() {
    const totalPages = Math.ceil(this.options.count / this.options.pageSize);
    if (this.options.page < totalPages) {
      this.onForwardPage(this.options.page + 1);
    }
  }

  handleBackwardPage() {
    if (this.options.page > 1) {
      this.onBackwardPage(this.options.page - 1);
    }
  }

  handleSetPageToShow(value: any) {
    this.onSetPageToShow(Number(value.target.value));
  }
}
