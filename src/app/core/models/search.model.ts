export class SearchModel {
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
    if (this.search) {
      this.search = btoa(this.search).replaceAll('=', '');
    }
    return `?page=${this.page}&pageSize=${this.pageSize}&search="${this.search}"`;
  }
}
