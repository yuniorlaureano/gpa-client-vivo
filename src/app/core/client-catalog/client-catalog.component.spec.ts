import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCatalogComponent } from './client-catalog.component';

describe('ClientCatalogComponent', () => {
  let component: ClientCatalogComponent;
  let fixture: ComponentFixture<ClientCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientCatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
