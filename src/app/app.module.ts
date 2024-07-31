import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ProductService } from './inventory/service/product.service';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot([AppState, AuthState], {
      developmentMode: true,
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
    provideHttpClient(withInterceptors([JwtAuthInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
