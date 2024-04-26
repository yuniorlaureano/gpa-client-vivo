import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturedProductEntryComponent } from './manufactured-product-entry.component';

describe('ManufacturedProductEntryComponent', () => {
  let component: ManufacturedProductEntryComponent;
  let fixture: ComponentFixture<ManufacturedProductEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManufacturedProductEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManufacturedProductEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
