import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../../core/models/response.model';
import { FilterModel } from '../../core/models/filter.model';
import { PrintInformationModel } from '../model/print-information.model';
import { ReportTemplateModel } from '../model/report-template.model';

@Injectable()
export class PrintInformationService {
  url = `${environment.api_url}/general/prints`;
  constructor(private http: HttpClient) {}

  getPrintInformation(
    search: FilterModel | null = null
  ): Observable<ResponseModel<PrintInformationModel>> {
    return this.http.get<ResponseModel<PrintInformationModel>>(
      `${this.url}${search ? search.asQueryString() : ''}`
    );
  }

  getPrintInformationById(id: string): Observable<PrintInformationModel> {
    return this.http.get<PrintInformationModel>(`${this.url}/${id}`);
  }

  addPrintInformation(
    model: PrintInformationModel
  ): Observable<PrintInformationModel> {
    return this.http.post<PrintInformationModel>(`${this.url}`, model);
  }

  updatePrintInformation(model: PrintInformationModel): Observable<void> {
    return this.http.put<void>(`${this.url}/${model.id}`, model);
  }

  deletePrintInformation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  uploadFile(model: FormData): Observable<void> {
    return this.http.post<void>(`${this.url}/photo/upload`, model);
  }

  getReportTemplates(
    search: FilterModel | null = null
  ): Observable<ReportTemplateModel[]> {
    return this.http.get<ReportTemplateModel[]>(
      `${this.url}/templates${search ? search.asQueryString() : ''}`
    );
  }

  getReporteTemplateById(id: string): Observable<ReportTemplateModel> {
    return this.http.get<ReportTemplateModel>(`${this.url}/templates/${id}`);
  }

  updateReportTemplate(model: ReportTemplateModel): Observable<void> {
    return this.http.put<void>(`${this.url}/templates/${model.id}`, model);
  }
}
