import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ProductModel } from '../models/product.model';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  url = `${environment.api_url}/inventory/products`;
  constructor(private http: HttpClient) {}

  getProducts(
    search: SearchModel | null = null
  ): Observable<ResponseModel<ProductModel>> {
    return this.http.get<ResponseModel<ProductModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }
}
