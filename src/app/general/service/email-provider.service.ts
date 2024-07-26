import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { SearchModel } from '../../core/models/search.model';
import { EmailConfigurationModel } from '../model/email-configuration.model';

@Injectable()
export class EmailProviderService {
  url = `${environment.api_url}/general/emailproviders`;
  constructor(private http: HttpClient) {}

  getEmailProvider(
    search: SearchModel | null = null
  ): Observable<ResponseModel<EmailConfigurationModel>> {
    return this.http.get<ResponseModel<EmailConfigurationModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getEmailProviderById(id: string): Observable<EmailConfigurationModel> {
    return this.http.get<EmailConfigurationModel>(`${this.url}/${id}`);
  }

  addEmailProvider(model: EmailConfigurationModel): Observable<void> {
    return this.http.post<void>(`${this.url}`, model);
  }

  updateEmailProvider(model: EmailConfigurationModel): Observable<void> {
    return this.http.put<void>(`${this.url}`, model);
  }
}
