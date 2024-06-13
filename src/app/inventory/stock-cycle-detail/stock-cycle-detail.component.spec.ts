import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCycleDetailComponent } from './stock-cycle-detail.component';

describe('StockCycleDetailComponent', () => {
  let component: StockCycleDetailComponent;
  let fixture: ComponentFixture<StockCycleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockCycleDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockCycleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
