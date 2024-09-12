import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ProductService } from './inventory/service/product.service';
import {
  withInterceptors,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtAuthInterceptor } from './core/interceptor/jwt-auth.interceptor';
import { TokenService } from './core/service/token.service';
import { AuthService } from './security/service/auth.service';
import { StockService } from './inventory/service/stock.service';
import { ProviderService } from './inventory/service/provider.service';
import { ClientService } from './invoice/service/client.service';
import { InvoiceService } from './invoice/service/invoice.service';
import { ReasonService } from './inventory/service/reason.service';
import { CategoryService } from './inventory/service/category.service';
import { ReceivableAccountService } from './invoice/service/receivable-account.service';
import { UnitService } from './general/service/unit.service';
import { StockCycleService } from './inventory/service/cycle.service';
import { AddonService } from './inventory/service/addon.service';
import { UserService } from './security/service/user.service';
import { ProfileService } from './security/service/profile.service';
import { PermissionService } from './security/service/permission.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { AppState } from './core/ng-xs-store/states/app.state';
import { ErrorService } from './core/service/error.service';
import { EmailProviderService } from './general/service/email-provider.service';
import { AuthState } from './core/ng-xs-store/states/auth.state';
import { BlobStorageProviderService } from './general/service/blob-storage-provider.service';
import { PrintInformationService } from './general/service/print-information.service';
import { environment } from '../environments/environment';
import { DashboardService } from './general/service/dashboard.service';
import { ReportService } from './report/service/report.service';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot([AppState, AuthState], {
      developmentMode: environment.development,
    }),
  ],
  providers: [
    ProductService,
    StockService,
    ProviderService,
    TokenService,
    AuthService,
    ClientService,
    InvoiceService,
    ReasonService,
    CategoryService,
    ReceivableAccountService,
    UnitService,
    StockCycleService,
    AddonService,
    UserService,
    ProfileService,
    PermissionService,
    ErrorService,
    EmailProviderService,
    BlobStorageProviderService,
    PrintInformationService,
    DashboardService,
    ReportService,
    provideHttpClient(withInterceptors([JwtAuthInterceptor])),
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
