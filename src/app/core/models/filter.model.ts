export class FilterModel {
  page: number = 1;
  pageSize: number = 10;
  search: string | null = null;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    search: string | null = null
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.search = search;
  }
  asQueryString(): string {
    let search = '';
    if (this.search) {
      search = btoa(this.search);
    }
    return `?page=${this.page}&pageSize=${this.pageSize}&search=${search}`;
  }
}
