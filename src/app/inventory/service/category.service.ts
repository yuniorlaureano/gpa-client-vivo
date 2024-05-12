import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { CategoryModel } from '../models/category.model';

@Injectable()
export class CategoryService {
  url = `${environment.api_url}/inventory/categories`;
  constructor(private http: HttpClient) {}

  getCategory(
    search: SearchModel | null = null
  ): Observable<ResponseModel<CategoryModel>> {
    return this.http.get<ResponseModel<CategoryModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getCategoryById(id: string): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(`${this.url}/${id}`);
  }

  addCategory(model: CategoryModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateCategory(model: CategoryModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
