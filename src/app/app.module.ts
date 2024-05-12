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
import { AuthService } from './security/service/auth..service';
import { StockService } from './inventory/service/stock.service';
import { ProviderService } from './inventory/service/provider.service';
import { ClientService } from './invoice/service/client.service';
import { InvoiceService } from './invoice/service/invoice.service';
import { ReasonService } from './inventory/service/reason.service';
import { CategoryService } from './inventory/service/category.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CoreModule, HttpClientModule],
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
    provideHttpClient(withInterceptors([JwtAuthInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
